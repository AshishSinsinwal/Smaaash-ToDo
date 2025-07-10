/* ========================================
   TASK MANAGER - ORGANIZED JAVASCRIPT
   ======================================== */

// ========================================
// DOM ELEMENTS
// ========================================
const main = document.querySelector("main");
const addIcon = document.querySelector("#add-icon");
const taskForm = document.getElementById("add-task-template");
const taskList = document.querySelector(".task-to-compl ul");
const abtTask = document.querySelector(".abt-task");
const editPage = document.querySelector(".edit-page");

// Form Elements
const newTaskInput = document.getElementById("newtask");
const deadlineInput = document.getElementById("deadline");
const taskAddBtn = document.getElementById("task-added");

// State
let currentTask = null;

// ========================================
// INITIALIZATION
// ========================================
function initApp() {
  initEventListeners();
  loadSavedTasks();
}

function initEventListeners() {
  // Task Form Events
  addIcon.addEventListener("click", showTaskForm);
  document.querySelector("#add-task-template i").addEventListener("click", hideTaskForm);
  taskAddBtn.addEventListener("click", handleAddTask);
  
  // Task List Events
  taskList.addEventListener("click", handleTaskListClick);
  
  // Task Details Events
  document.querySelector(".abt-task #del").addEventListener("click", deleteCurrentTask);
  document.querySelector(".abt-task i").addEventListener("click", hideTaskDetails);
  document.getElementById("edit").addEventListener("click", showEditForm);
  
  // Edit Form Events
  document.getElementById("close").addEventListener("click", hideEditForm);
  document.querySelector(".edit-page #task-added").addEventListener("click", saveEditedTask);
}

// ========================================
// TASK LOADING & STATUS
// ========================================
function loadSavedTasks() {
  taskList.innerHTML = '';
  
  const tasks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const taskName = localStorage.key(i);
    if (taskName && taskName !== "someOtherKeyYouMightHave") {
      tasks.push({
        name: taskName,
        deadline: localStorage.getItem(taskName) || "No Deadline"
      });
    }
  }
  
  tasks.forEach(task => {
    if (task.deadline) {
      const status = checkDateStatus(task.deadline);
      addTaskToList(task.name, task.deadline, status);
    }
  });
}

function checkDateStatus(inputDateStr) {
  const inputDate = new Date(inputDateStr);
  const today = new Date();

  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffInMs = inputDate - today;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0 || diffInDays === 1) {
    return "attention";
  } else if (diffInDays < 0) {
    return "missed";
  }
}

// ========================================
// TASK FORM FUNCTIONS
// ========================================
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
  
  if (!validateTask(taskName)) return;
  
  saveTask(taskName, deadline);
  addTaskToList(taskName, deadline);
  
  newTaskInput.value = "";
  deadlineInput.value = "";
  hideTaskForm();
}

function validateTask(taskName) {
  if (!taskName) {
    newTaskInput.classList.add("is-invalid");
    alert("Task is required.");
    return false;
  }
  
  newTaskInput.classList.remove("is-invalid");
  return true;
}

// ========================================
// TASK LIST FUNCTIONS
// ========================================
function handleTaskListClick(e) {
  const li = e.target.closest("li");
  if (!li) return;
  
  if (e.target.tagName === "BUTTON" || e.target.tagName === "I") {
    const taskName = li.querySelector(".task-name").textContent;
    li.remove();
    deleteTask(taskName);
  } else {
    const taskName = li.querySelector(".task-name").textContent;
    showTaskDetails(taskName);
  }
}

function addTaskToList(taskName, deadline, taskAttention) {
  const li = document.createElement("li");
  
  li.innerHTML = `
    <span class="task-name">${taskName}</span>
    <span class="task-deadline">${deadline || 'No deadline'}</span>
    <button class="task-done">
      <i class="fa-solid fa-circle-check"></i>
    </button>
  `;
  
  if (taskAttention === "attention") {
    li.classList.add("task-attention");
  } else if (taskAttention === "missed") {
    li.classList.add("task-missed");
  }
  
  taskList.appendChild(li);
}

// ========================================
// TASK DETAILS FUNCTIONS
// ========================================
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

// ========================================
// EDIT FORM FUNCTIONS
// ========================================
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
  
  if (currentTask !== newName) {
    deleteTask(currentTask);
  }
  saveTask(newName, newDeadline);
  
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

// ========================================
// STORAGE FUNCTIONS
// ========================================
function saveTask(taskName, deadline) {
  localStorage.setItem(taskName, deadline);
  location.reload();
}

function getTaskDeadline(taskName) {
  return localStorage.getItem(taskName);
}

function deleteTask(taskName) {
  localStorage.removeItem(taskName);
  location.reload();
}

// ========================================
// START APPLICATION
// ========================================
initApp();