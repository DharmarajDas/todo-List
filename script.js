// Elements
const inputBox = document.getElementById("input-box");
const inputButton = document.getElementById("input-button");
const listContainer = document.getElementById("list-container");
const quoteBox = document.getElementById("quote-box");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

// localStorage key
const STORAGE_KEY = "tasks_v1";

// Tasks array (each: {id: string, text: string, completed: bool})
let tasks = [];

/* ---------------- Motivational Quotes ---------------- */
const quotes = [
  "Believe you can and you're halfway there.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Great things never come from comfort zones.",
  "Push yourself, because no one else is going to do it for you.",
  "Success doesn’t just find you. You have to go out and get it.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Dream it. Wish it. Do it.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Stay positive, work hard, make it happen.",
  "Your only limit is your mind."
];
function showRandomQuote() {
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

/* ---------------- Storage ---------------- */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      tasks = JSON.parse(raw);
    } catch (e) {
      tasks = [];
    }
  } else {
    tasks = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------------- Rendering ---------------- */
function renderTasks() {
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    // label (checkbox + text)
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.completed;
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);

    // action buttons
    const editBtn = document.createElement("span");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    listContainer.appendChild(li);
  });

  updateProgress();
}

/* ---------------- Progress ---------------- */
function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  if (total === 0) {
    progressText.textContent = "No tasks yet";
    progressFill.style.width = "0%";
    return;
  }
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `Progress: ${pct}%`;
  progressFill.style.width = `${pct}%`;
}

/* ---------------- Actions ---------------- */
function addTask() {
  const text = inputBox.value.trim();
  if (!text) {
    alert("Please write down a task");
    return;
  }
  const id = Date.now().toString();
  tasks.push({ id, text, completed: false });
  saveToStorage();
  renderTasks();
  inputBox.value = "";
  inputBox.focus();
}

// event delegation for list (edit, delete, checkbox)
listContainer.addEventListener("click", function (e) {
  const target = e.target;
  const li = target.closest("li");
  if (!li) return;
  const id = li.dataset.id;
  // Delete
  if (target.classList.contains("delete-btn")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveToStorage();
    renderTasks();
    return;
  }
  // Edit (inline)
  if (target.classList.contains("edit-btn")) {
    const span = li.querySelector(".task-text");
    if (!span) return;

    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "inline-edit";
    input.value = currentText;

    span.replaceWith(input);
    input.focus();
    input.select();

    function commitEdit() {
      const newText = input.value.trim();
      if (newText.length === 0) {
        // keep old text if empty
        input.replaceWith(span);
        return;
      }
      // update model
      const t = tasks.find((x) => x.id === id);
      if (t) t.text = newText;
      saveToStorage();
      // replace input with new span
      const newSpan = document.createElement("span");
      newSpan.className = "task-text";
      newSpan.textContent = newText;
      input.replaceWith(newSpan);
    }

    input.addEventListener("blur", commitEdit);
    input.addEventListener("keyup", function (ev) {
      if (ev.key === "Enter") commitEdit();
      if (ev.key === "Escape") {
        input.replaceWith(span); // cancel
      }
    });

    return;
  }
});

// Handle checkbox changes (separate listener)
listContainer.addEventListener("change", function (e) {
  const target = e.target;
  if (target.tagName.toLowerCase() !== "input" || target.type !== "checkbox")
    return;
  const li = target.closest("li");
  if (!li) return;
  const id = li.dataset.id;
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !!target.checked;
  saveToStorage();
  renderTasks(); // re-render to reflect .completed styling
  if (t.completed) showRandomQuote();
});

/* ---------------- Wiring ---------------- */
inputButton.addEventListener("click", addTask);
inputBox.addEventListener("keyup", function (e) {
  if (e.key === "Enter") addTask();
});

/* ---------------- Init ---------------- */
function init() {
  loadFromStorage();
  renderTasks();
  showRandomQuote();
}

init();
