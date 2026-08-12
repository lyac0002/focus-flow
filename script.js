const taskForm = document.querySelector("#task-form");
const taskName = document.querySelector("#task-name");
const dueDate = document.querySelector("#due-date");
const priority = document.querySelector("#priority");

const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");
const taskError = document.querySelector("#task-error");

const activeCount = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");

const filterButtons = document.querySelectorAll(".filter-btn");
const sortTasks = document.querySelector("#sort-tasks");

let tasks = JSON.parse(localStorage.getItem("focusFlowTasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("focusFlowTasks", JSON.stringify(tasks));
}

taskForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = taskName.value.trim();

  if (name === "") {
    taskError.textContent = "Please enter a task name.";
    return;
  }

  taskError.textContent = "";

  const newTask = {
    id: Date.now(),
    name: name,
    date: dueDate.value,
    priority: priority.value,
    completed: false
  };

  tasks.push(newTask);

  saveTasks();
  showTasks();
  taskForm.reset();
});

function showTasks() {
  taskList.innerHTML = "";

  let visibleTasks = [...tasks];

  if (currentFilter === "active") {
    visibleTasks = visibleTasks.filter(function(task) {
      return !task.completed;
    });
  }

  if (currentFilter === "completed") {
    visibleTasks = visibleTasks.filter(function(task) {
      return task.completed;
    });
  }

  if (sortTasks.value === "date") {
    visibleTasks.sort(function(a, b) {
      if (!a.date) return 1;
      if (!b.date) return -1;

      return new Date(a.date) - new Date(b.date);
    });
  }

  if (sortTasks.value === "priority") {
    const order = {
      high: 1,
      medium: 2,
      low: 3
    };

    visibleTasks.sort(function(a, b) {
      return order[a.priority] - order[b.priority];
    });
  }

  if (visibleTasks.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  visibleTasks.forEach(function(task) {
    const item = document.createElement("div");

    item.classList.add("task-item");

    if (task.completed) {
      item.classList.add("completed");
    }

    item.innerHTML = `
      <div class="task-top">
        <h3 class="task-title">${task.name}</h3>
        <span class="priority">${task.priority}</span>
      </div>

      <p class="task-details">
        Due: ${task.date || "No due date"}
      </p>

      <div class="task-actions">
        <button class="complete-btn">
          ${task.completed ? "Undo" : "Complete"}
        </button>

        <button class="edit-btn">
          Edit
        </button>

        <button class="delete-btn">
          Delete
        </button>
      </div>
    `;

    const completeButton = item.querySelector(".complete-btn");
    const editButton = item.querySelector(".edit-btn");
    const deleteButton = item.querySelector(".delete-btn");

    completeButton.addEventListener("click", function() {
      task.completed = !task.completed;

      saveTasks();
      showTasks();
    });

    editButton.addEventListener("click", function() {
      const newName = prompt("Edit your task:", task.name);

      if (newName !== null && newName.trim() !== "") {
        task.name = newName.trim();

        saveTasks();
        showTasks();
      }
    });

    deleteButton.addEventListener("click", function() {
      tasks = tasks.filter(function(item) {
        return item.id !== task.id;
      });

      saveTasks();
      showTasks();
    });

    taskList.appendChild(item);
  });

  updateCounts();
}

function updateCounts() {
  const activeTasks = tasks.filter(function(task) {
    return !task.completed;
  });

  const completedTasks = tasks.filter(function(task) {
    return task.completed;
  });

  activeCount.textContent = activeTasks.length;
  completedCount.textContent = completedTasks.length;
}

filterButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function(btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    showTasks();
  });
});

sortTasks.addEventListener("change", function() {
  showTasks();
});


// Pomodoro timer

const timerDisplay = document.querySelector("#timer-display");
const timerText = document.querySelector("#timer-text");

const startTimer = document.querySelector("#start-timer");
const pauseTimer = document.querySelector("#pause-timer");
const resetTimer = document.querySelector("#reset-timer");

const focusMode = document.querySelector("#focus-mode");
const breakMode = document.querySelector("#break-mode");

let timeLeft = 25 * 60;
let timerInterval;
let timerRunning = false;
let currentMode = "focus";

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

startTimer.addEventListener("click", function() {
  if (timerRunning) {
    return;
  }

  timerRunning = true;

  timerInterval = setInterval(function() {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimer();
    } else {
      clearInterval(timerInterval);
      timerRunning = false;

      alert("Session finished!");
    }
  }, 1000);
});

pauseTimer.addEventListener("click", function() {
  clearInterval(timerInterval);
  timerRunning = false;
});

resetTimer.addEventListener("click", function() {
  clearInterval(timerInterval);
  timerRunning = false;

  if (currentMode === "focus") {
    timeLeft = 25 * 60;
  } else {
    timeLeft = 5 * 60;
  }

  updateTimer();
});

focusMode.addEventListener("click", function() {
  clearInterval(timerInterval);

  timerRunning = false;
  currentMode = "focus";
  timeLeft = 25 * 60;

  timerText.textContent = "Focus Session";

  focusMode.classList.add("active-mode");
  breakMode.classList.remove("active-mode");

  updateTimer();
});

breakMode.addEventListener("click", function() {
  clearInterval(timerInterval);

  timerRunning = false;
  currentMode = "break";
  timeLeft = 5 * 60;

  timerText.textContent = "Break Time";

  breakMode.classList.add("active-mode");
  focusMode.classList.remove("active-mode");

  updateTimer();
});

showTasks();
updateTimer();