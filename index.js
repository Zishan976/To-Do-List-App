import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { sendReminder } from "./reminder.js";
import { Server } from "socket.io";
import http from "http";
import session from "express-session";
import cron from "node-cron";
import dotenv from "dotenv";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
dotenv.config();

app.use(
  session({
    secret: "zishan_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  setInterval(async () => {
    try {
      const { rows: dueTasks } = await db.query(
        "SELECT items.* FROM items JOIN users ON items.user_id = users.id WHERE items.due_date <= (NOW() AT TIME ZONE 'Asia/Dhaka')"
      );
      if (dueTasks.length > 0) {
        socket.emit("reminder", dueTasks);
      }
    } catch (err) {
      console.error("WebSocket query error:", err);
    }
  }, 60000);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "zishan",
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

app.post("/register", async (req, res) => {
  const { name, email } = req.body;
  try {
    // Check if user exists
    let result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user;
    if (result.rows.length === 0) {
      // Insert new user
      result = await db.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [name, email]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
    }
    // Set session
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.render("index.ejs", { user: null });
  }
  try {
    const userId = req.session.user.id;
    const result = await db.query(
      "SELECT * FROM items WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );

    const date = new Date();
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    console.log(dayName); // Outputs the full weekday name

    res.render("index.ejs", {
      listTitle: dayName,
      listItems: result.rows,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    const item = req.body.newItem;
    // Store dueDate as is without converting to ISO string to preserve local time
    const dueDate = req.body.dueDate
      ? req.body.dueDate
      : (() => {
          // Get current time in Asia/Dhaka timezone (UTC+6)
          const now = new Date();
          // Calculate offset in milliseconds for Asia/Dhaka (UTC+6)
          const offset = 6 * 60 * 60 * 1000;
          const dhakaTime = new Date(now.getTime() + offset);
          return dhakaTime.toISOString();
        })();
    const userId = req.session.user.id;

    await db.query(
      "INSERT INTO items (title, due_date, user_id) VALUES ($1, $2, $3)",
      [item, dueDate, userId]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  const editedItemId = req.body.updatedItemId;
  const editedItemTitle = req.body.updatedItemTitle;
  const userId = req.session.user.id;
  try {
    const result = await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 AND user_id = $3",
      [editedItemTitle, editedItemId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(403).send("Unauthorized");
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  const deletedItemId = req.body.deleteItemId;
  const userId = req.session.user.id;
  try {
    const result = await db.query(
      "DELETE FROM items WHERE id = $1 AND user_id = $2",
      [deletedItemId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(403).send("Unauthorized");
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/due-tasks", async (req, res) => {
  if (!req.session.user) {
    return res.json([]);
  }
  try {
    const userId = req.session.user.id;
    const { rows: overdueTasks } = await db.query(
      `SELECT items.title, users.email 
       FROM items 
       JOIN users ON items.user_id = users.id 
       WHERE items.due_date <= (NOW() AT TIME ZONE 'Asia/Dhaka') AND users.id = $1`,
      [userId]
    );

    overdueTasks.forEach((task) => {
      sendReminder(task.email, task.title); // Sends email to correct user
    });

    res.json(overdueTasks);
  } catch (err) {
    console.error("Error fetching due tasks:", err);
    res.status(500).send("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

cron.schedule("* * * * *", async () => {
  try {
    // Select overdue tasks that have not been reminded yet
    const { rows: overdueTasks } = await db.query(
      `SELECT items.id, items.title, users.email 
       FROM items 
       JOIN users ON items.user_id = users.id 
       WHERE items.due_date <= (NOW() AT TIME ZONE 'Asia/Dhaka') AND (items.reminder_sent IS NULL OR items.reminder_sent = false)`
    );

    for (const task of overdueTasks) {
      await sendReminder(task.email, task.title);
      console.log(
        `Email reminder sent to ${task.email} for task "${task.title}"`
      );
      // Mark the task as reminded
      await db.query("UPDATE items SET reminder_sent = true WHERE id = $1", [
        task.id,
      ]);
    }
  } catch (err) {
    console.error("Error in scheduled email reminders:", err);
  }
});
