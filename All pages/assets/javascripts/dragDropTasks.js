let todoList = document.getElementById("to-do");
let inProgressList = document.getElementById("in-progress");
let onHoldList = document.getElementById("on-hold");
let completedList = document.getElementById("completed");
let canceledList = document.getElementById("canceled");

// Initialize the sortable lists
new Sortable(todoList, {
  group: "shared", // Enable dragging between lists
  animation: 150,
  onEnd: updateTaskPosition,
});

new Sortable(inProgressList, {
  group: "shared",
  animation: 150,
  onEnd: updateTaskPosition,
});

new Sortable(onHoldList, {
  group: "shared",
  animation: 150,
  onEnd: updateTaskPosition,
});

new Sortable(completedList, {
  group: "shared",
  animation: 150,
  onEnd: updateTaskPosition,
});

new Sortable(canceledList, {
  group: "shared",
  animation: 150,
  onEnd: updateTaskPosition,
});

// Get Task By Id
function getTaskById(id) {
  let task = tasks.find((task) => task.id === id);
  return task;
}

// Save the edited task to the local storage
function updateTaskPosition(evt) {
  let task = getTaskById(+evt.item.id.split("-")[2]);
  let newStatus = evt.to.id;
  let oldStatus = task.status;
  task.status = newStatus;

  document.getElementById(newStatus + "-tasks-count").innerText = `(${
    tasks.filter((task) => task.status === newStatus).length
  })`;
  document.getElementById(oldStatus + "-tasks-count").innerText = `(${
    tasks.filter((task) => task.status === oldStatus).length
  })`;
  localStorage.tasks = JSON.stringify(tasks);
}
