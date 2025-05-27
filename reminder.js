import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("SMTP Auth Config:", {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
});
// Configure email transport for real SMTP provider
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send an email reminder
export async function sendReminder(email, taskTitle) {
  try {
    await transporter.sendMail({
      from: `"Todo App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Task Reminder",
      html: `<p>Your task <strong>"${taskTitle}"</strong> is <span style="color:red;">overdue!</span></p>`,
    });
    console.log("Reminder sent for:", taskTitle);
  } catch (err) {
    console.error(`Error sending email to ${email}:`, err.message);
  }
}
