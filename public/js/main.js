function handler(id) {
  console.log("Edit button clicked for:", id); // Debugging

  const title = document.getElementById("title" + id);
  const editBtn = document.getElementById("edit" + id);
  const doneBtn = document.getElementById("done" + id);
  const inputField = document.getElementById("input" + id);

  if (title && editBtn && doneBtn && inputField) {
    title.hidden = true;
    editBtn.hidden = true;
    doneBtn.hidden = false;
    inputField.hidden = false;
    inputField.focus(); // Auto-focus for smooth editing
  } else {
    console.error("Error: Missing elements for ID", id);
  }
}
if ("Notification" in window) {
  Notification.requestPermission().then((perm) => {
    if (perm === "granted") {
      setInterval(async () => {
        const overdueTasks = await fetch("/due-tasks").then((res) =>
          res.json()
        );
        overdueTasks.forEach((task) => {
          if (!localStorage.getItem(`notified_${task.id}`)) {
            new Notification("Task Reminder!", {
              body: `"${task.title}" is overdue!`,
            });
            localStorage.setItem(`notified_${task.id}`, true); // Prevent duplicate notifications
          }
        });
      }, 60000);
    }
  });
}

function toggleDatePicker() {
  const dateInput = document.getElementById("dueDateInput");
  if (dateInput.style.display === "none") {
    dateInput.style.display = "inline-block"; // Show when clicked
    dateInput.showPicker(); // Open the date picker
  } else {
    dateInput.style.display = "none"; // Hide if clicked again
  }
}

const socket = io();
socket.on("reminder", (dueTasks) => {
  dueTasks.forEach((task) => {
    new Notification("Task Reminder!", {
      body: `"${task.title}" is overdue!`,
    });
  });
});
