const main = document.querySelector("main");
const plusBtn = document.getElementById("plus-task");
const taskForm = document.getElementById("add-task-template");
const taskList = document.querySelector(".task-to-compl ul");
const abtTask = document.querySelector(".abt-task");
const editPage = document.querySelector(".edit-page");
const userIcon = document.getElementById("user-icon");
const userName = document.getElementById("user-name");


// Form Elements
const newTaskInput = document.getElementById("newtask");
const deadlineInput = document.getElementById("deadline");
const taskAddBtn = document.getElementById("task-added");

// State
let currentTask = null;

// Initialize Event Listeners
function initEventListeners() {
  // Task Form
  plusBtn.addEventListener("click", showTaskForm);
  document.querySelector("#add-task-template i").addEventListener("click", hideTaskForm);
  taskAddBtn.addEventListener("click", handleAddTask);
  
  // Task List
  taskList.addEventListener("click", handleTaskListClick);
  
  // Task Details Panel
  document.querySelector(".abt-task #del").addEventListener("click", deleteCurrentTask);
  document.querySelector(".abt-task i").addEventListener("click", hideTaskDetails);
  document.getElementById("edit").addEventListener("click", showEditForm);
  
  // Edit Form
  document.getElementById("close").addEventListener("click", hideEditForm);
  document.querySelector(".edit-page #task-added").addEventListener("click", saveEditedTask);
}

// Load all saved tasks when page loads
function loadSavedTasks() {
  // Clear existing tasks in the UI (if any)
  taskList.innerHTML = '';
  
  // Get all tasks from localStorage
  const tasks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const taskName = localStorage.key(i);
    // Skip any non-task items you might have in localStorage
    if (taskName && taskName !== "someOtherKeyYouMightHave") {
      tasks.push({
        name: taskName,
        deadline: localStorage.getItem(taskName)
      });
    }
  }
  
  // Add tasks to the UI
  tasks.forEach(task => {
   
    if(task.deadline){
        const status = checkDateStatus(task.deadline);
        addTaskToList(task.name, task.deadline, status);


    }

  });
}



function checkDateStatus(inputDateStr) {
  const inputDate = new Date(inputDateStr);
  const today = new Date();

  // Remove time part from both dates
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Calculate difference in milliseconds
  const diffInMs = inputDate - today;

  // Convert to days
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0 || diffInDays === 1) {
    console.log("attention")
    return "attention";
  } else if (diffInDays < 0) {
    console.log("missed");
    return "missed";
  } 
}




// Task Form Functions
function showTaskForm() {
  taskForm.style.display = "block";
  main.style.opacity = "0.5";
  newTaskInput.focus();
}

function hideTaskForm() {
  taskForm.style.display = "none";
  main.style.opacity = "1";
}

function handleAddTask() {
  const taskName = newTaskInput.value.trim();
  const deadline = deadlineInput.value;
  
  if (!taskName) return;
  
  saveTask(taskName, deadline);
  addTaskToList(taskName, deadline);
  
  // Reset form
  newTaskInput.value = "";
  deadlineInput.value = "";
  hideTaskForm();
}

// Task List Functions
function handleTaskListClick(e) {
  const li = e.target.closest("li");
  if (!li) return;
  
  if (e.target.tagName === "BUTTON") {
    // Delete task
    const taskName = li.querySelector(".task-name").textContent;
    li.remove();
    deleteTask(taskName);
  } else {
    // Show task details
    const taskName = li.querySelector(".task-name").textContent;
    showTaskDetails(taskName);
  }
}
function addTaskToList(taskName, deadline, taskAttention) {
  const li = document.createElement("li");
  
  // Fixed template literal with backticks
  li.innerHTML = `
    <span class="task-name">${taskName}</span>
    <span class="task-deadline">${deadline || 'No deadline'}</span>
    <button class="task-done">✓</button>
  `;
  
  // More robust class assignment
  if (taskAttention === "attention") {
    li.classList.add("task-attention");
  } else if (taskAttention === "missed") {
    li.classList.add("task-missed");
  }
  // Optional: else case if needed
  
  taskList.appendChild(li);
}

// Task Details Functions
function showTaskDetails(taskName) {
  currentTask = taskName;
  
  document.querySelector(".abt-task h1").textContent = taskName;
  document.querySelector(".abt-task span").textContent = 
    getTaskDeadline(taskName) || "No deadline";
  
  abtTask.style.display = "block";
  main.style.opacity = "0.5";
}

function hideTaskDetails() {
  abtTask.style.display = "none";
  main.style.opacity = "1";
  currentTask = null;
}

function deleteCurrentTask() {
  if (!currentTask) return;
  
  const taskItems = document.querySelectorAll(".task-name");
  taskItems.forEach(item => {
    if (item.textContent === currentTask) {
      item.closest("li").remove();
    }
  });
  
  deleteTask(currentTask);
  hideTaskDetails();
}

// Edit Form Functions
function showEditForm() {
  if (!currentTask) return;
  
  const deadline = getTaskDeadline(currentTask);
  document.querySelector(".edit-page #newtask").value = currentTask;
  document.querySelector(".edit-page #deadline").value = deadline || "";
  
  editPage.style.display = "block";
  abtTask.style.display = "none";
}

function hideEditForm() {
  editPage.style.display = "none";
  main.style.opacity = "1";
}

function saveEditedTask() {
  const newName = document.querySelector(".edit-page #newtask").value.trim();
  const newDeadline = document.querySelector(".edit-page #deadline").value;
  
  if (!newName) return;
  
  // Update in storage
  if (currentTask !== newName) {
    deleteTask(currentTask);
  }
  saveTask(newName, newDeadline);
  
  // Update in UI
  const taskItems = document.querySelectorAll(".task-name");
  taskItems.forEach(item => {
    if (item.textContent === currentTask) {
      item.textContent = newName;
      const deadlineElement = item.nextElementSibling;
      if (deadlineElement.classList.contains("task-deadline")) {
        deadlineElement.textContent = newDeadline || 'No deadline';
      }
    }
  });
  
  currentTask = newName;
  hideEditForm();
}

userIcon.addEventListener("click", () => {
  userIcon.style.display = "none";
  userName.style.display = "inline-block";
});

userName.addEventListener("click", () => {
  userName.style.display = "none";
  userIcon.style.display = "inline-block";
});

// Storage Functions
function saveTask(taskName, deadline) {
  localStorage.setItem(taskName, deadline);
}

function getTaskDeadline(taskName) {
  return localStorage.getItem(taskName);
}

function deleteTask(taskName) {
  localStorage.removeItem(taskName);
}

// Initialize the app
function initApp() {
  initEventListeners();
  loadSavedTasks(); // Load saved tasks when app starts
}

// Start the application
initApp();