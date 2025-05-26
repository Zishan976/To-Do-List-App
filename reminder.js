import nodemailer from "nodemailer";

// Configure email transport
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "amani.skiles@ethereal.email",
    pass: "AMHPsaMUVNZZN2tfSH",
  },
});

// Function to send an email reminder
export async function sendReminder(email, taskTitle) {
  try {
    await transporter.sendMail({
      from: '"Zishan" <amani.skiles@ethereal.email>',
      to: email,
      subject: "Task Reminder",
      html: `<p>Your task <strong>"${taskTitle}"</strong> is <span style="color:red;">overdue!</span></p>`,
    });
    console.log("Reminder sent for:", taskTitle);
  } catch (err) {
    console.error(`Error sending email to ${email}:`, err.message);
  }
}
