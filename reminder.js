import nodemailer from "nodemailer";

// Configure email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "sharkarzishan@gmail.com",
    pass: process.env.EMAIL_PASS || "Zish@n2002",
  },
});

// Function to send an email reminder
export async function sendReminder(email, taskTitle) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "sharkarzishan@gmail.com",
      to: email,
      subject: "Task Reminder",
      html: `<p>Your task <strong>"${taskTitle}"</strong> is <span style="color:red;">overdue!</span></p>`,
    });
    console.log("Reminder sent for:", taskTitle);
  } catch (err) {
    console.error(`Error sending email to ${email}:`, err.message);
  }
}
