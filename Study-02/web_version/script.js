const todoInput = document.getElementById('todo-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterArea = document.getElementById('filter-area');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const STORAGE_KEY = 'todos';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    // localStorage 사용 불가 시(용량 초과, 비공개 모드 등) 저장을 건너뛴다
  }
}

let todos = loadTodos();
let currentFilter = '전체';

function findTodo(id) {
  return todos.find((t) => t.id === id);
}

function addTodo() {
  const title = todoInput.value.trim();
  if (!title) return;

  todos.push({
    id: Date.now(),
    title,
    category: categorySelect.value,
    completed: false,
    createdAt: Date.now(),
  });

  todoInput.value = '';
  saveTodos();
  render();
}

function editTodo(id) {
  const todo = findTodo(id);
  if (!todo) return;

  const newTitle = prompt('할 일 수정', todo.title);
  if (newTitle === null) return;

  const trimmed = newTitle.trim();
  if (!trimmed) return;

  todo.title = trimmed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function toggleComplete(id) {
  const todo = findTodo(id);
  if (!todo) return;

  todo.completed = !todo.completed;
  saveTodos();
  render();
}

function updateProgress() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${completed} / ${total} 완료`;
}

function render() {
  todoList.innerHTML = '';

  const filtered =
    currentFilter === '전체'
      ? todos
      : todos.filter((t) => t.category === currentFilter);

  if (filtered.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = '할 일이 없습니다';
    todoList.appendChild(emptyMessage);
    updateProgress();
    return;
  }

  filtered.forEach((todo) => {
    const li = document.createElement('li');
    li.classList.add(todo.category);
    if (todo.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleComplete(todo.id));

    const categoryTag = document.createElement('span');
    categoryTag.textContent = todo.category;
    categoryTag.className = `category-tag ${todo.category}`;

    const titleSpan = document.createElement('span');
    titleSpan.textContent = todo.title;
    titleSpan.className = 'todo-title';

    const editBtn = document.createElement('button');
    editBtn.textContent = '수정';
    editBtn.addEventListener('click', () => editTodo(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(categoryTag);
    li.appendChild(titleSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });

  updateProgress();
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addTodo();
});

filterArea.addEventListener('click', (event) => {
  const btn = event.target.closest('.filter-btn');
  if (!btn) return;

  currentFilter = btn.dataset.category;

  filterArea
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.toggle('active', b === btn));

  render();
});

render();
