// === INITIAL SETUP ===
const defaultLists = ["My Day", "Important", "Planned", "Assigned to Me", "Tasks"];
let lists = JSON.parse(localStorage.getItem("todo_lists")) || defaultLists.slice();
let activeList = localStorage.getItem("todo_active") || "My Day";
let tasks = JSON.parse(localStorage.getItem(`tasks_${activeList}`)) || [];
let darkMode = localStorage.getItem("todo_dark") === "true";

// === ELEMENT REFERENCES ===
const listContainer  = document.getElementById("listContainer");
const taskList       = document.getElementById("taskList");
const taskInput      = document.getElementById("taskInput");
const dueDate        = document.getElementById("dueDate");
const addTaskBtn     = document.getElementById("addTaskBtn");
const activeListTitle= document.getElementById("activeListTitle");
const addListBtn     = document.getElementById("addListBtn");
const toggleTheme    = document.getElementById("toggleTheme");
const searchInput    = document.getElementById("searchInput");

// === THEME HANDLING ===
function applyTheme() {
  document.documentElement.classList.toggle("dark", darkMode);
}
toggleTheme.addEventListener("click", () => {
  darkMode = !darkMode;
  localStorage.setItem("todo_dark", darkMode);
  applyTheme();
});

// === RENDER SIDEBAR LISTS ===
function renderLists() {
  listContainer.innerHTML = "";
  lists.forEach(listName => {
    const btn = document.createElement("div");
    btn.className = [
      "w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center",
      listName === activeList
        ? "bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 font-semibold"
        : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
    ].join(" ");

    // list title
    const span = document.createElement("span");
    span.textContent = listName;
    span.className = "flex-1 cursor-pointer";
    span.onclick = () => switchList(listName);
    btn.appendChild(span);

    // delete button for custom lists
    if (!defaultLists.includes(listName)) {
      const del = document.createElement("button");
      del.innerHTML = "&times;";
      del.className = "text-red-500 hover:text-red-700 ml-2 text-sm";
      del.onclick = e => deleteList(e, listName);
      btn.appendChild(del);
    }

    listContainer.appendChild(btn);
  });
}

// === RENDER TASKS ===
function renderTasks() {
  taskList.innerHTML = "";
  activeListTitle.textContent = activeList;
  tasks = JSON.parse(localStorage.getItem(`tasks_${activeList}`)) || [];
  const filter = searchInput.value.toLowerCase();

  tasks
    .filter(t => t.text.toLowerCase().includes(filter))
    .forEach((task, idx) => {
      const li = document.createElement("li");
      li.className = [
        "flex justify-between items-center p-2 rounded-md shadow-sm",
        "bg-gray-100 dark:bg-gray-800",
        task.completed ? "opacity-60 line-through" : ""
      ].join(" ");

      li.innerHTML = `
        <div class="flex items-center gap-2">
          <input type="checkbox" ${task.completed? "checked": ""} onchange="toggleTask(${idx})"
                 class="accent-blue-600" />
          <span>${task.text}</span>
          ${task.due ? `<span class="ml-2 text-sm text-gray-500 dark:text-gray-400">📅 ${task.due}</span>` : ""}
        </div>
        <button onclick="deleteTask(${idx})" class="text-red-500 hover:text-red-700 text-lg font-bold">&times;</button>
      `;
      taskList.appendChild(li);
    });
}

// === TASK OPERATIONS ===
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) return;
  const newTask = { text, completed: false, due: dueDate.value || null };
  tasks.push(newTask);
  taskInput.value = "";
  dueDate.value = "";
  saveTasks();
  renderTasks();
});

function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(`tasks_${activeList}`, JSON.stringify(tasks));
}

// === LIST OPERATIONS ===
function switchList(name) {
  activeList = name;
  localStorage.setItem("todo_active", activeList);
  tasks = JSON.parse(localStorage.getItem(`tasks_${activeList}`)) || [];
  renderLists();
  renderTasks();
}

addListBtn.addEventListener("click", () => {
  const name = prompt("Enter new list name:");
  if (!name || lists.includes(name)) return;
  lists.push(name);
  localStorage.setItem("todo_lists", JSON.stringify(lists));
  localStorage.setItem(`tasks_${name}`, JSON.stringify([]));
  switchList(name);
});

function deleteList(e, name) {
  e.stopPropagation();
  if (!confirm(`Delete list "${name}"?`)) return;
  lists = lists.filter(l => l !== name);
  localStorage.setItem("todo_lists", JSON.stringify(lists));
  localStorage.removeItem(`tasks_${name}`);
  if (activeList === name) switchList("My Day");
  else renderLists();
}

// === SEARCH ===
searchInput.addEventListener("input", renderTasks);

// === INITIALIZE ===
applyTheme();
renderLists();
renderTasks();
