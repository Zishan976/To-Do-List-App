# Todo List Web Application

## Description

This is a web-based Todo List application that allows users to register, log in, and manage their tasks with due dates. The application provides real-time reminders for upcoming tasks using WebSocket technology and sends email notifications for overdue tasks. It is built with Express.js, PostgreSQL, and EJS templating.

The website is deployed and accessible at: [https://to-do-list-app-5fbw.onrender.com](https://to-do-list-app-5fbw.onrender.com)

## Features

- User registration and login via email
- Create, edit, and delete todo items
- Assign due dates to tasks
- Real-time task reminders using WebSocket (socket.io)
- Email notifications for overdue tasks
- Responsive and user-friendly interface
- Session management for user authentication

## Technologies Used

- Node.js with Express.js framework
- PostgreSQL database
- EJS templating engine
- Socket.io for real-time communication
- Nodemailer for sending email reminders
- Cron jobs for scheduled email notifications
- CSS for styling and responsive design

## Setup and Installation

1. Clone the repository.
2. Install dependencies:
   ```
   npm install
   ```
3. Set up a PostgreSQL database and run the provided `schema.sql` to create necessary tables.
4. Create a `.env` file in the project root with the following environment variables:
   ```
   PORT=3000
   DATABASE_URL=your_postgres_connection_string
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password_or_app_specific_password
   ```
5. Start the application:
   ```
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Register with your name and email or log in with your email.
- Add new tasks with optional due dates.
- Edit or delete existing tasks.
- Receive real-time reminders for due tasks.
- Get email notifications for overdue tasks.

## Environment Variables

- `PORT`: Port number for the server (default is 3000).
- `DATABASE_URL`: Connection string for PostgreSQL database.
- `SMTP_USER`: Email address used to send reminders.
- `SMTP_PASS`: Password or app-specific password for the email account.

## License

This project is open source and available under the MIT License.
