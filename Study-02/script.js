const todoInput = document.getElementById('todo-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterArea = document.getElementById('filter-area');

let todos = [];
let currentFilter = '전체';

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
  render();
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newTitle = prompt('할 일 수정', todo.title);
  if (newTitle === null) return;

  const trimmed = newTitle.trim();
  if (!trimmed) return;

  todo.title = trimmed;
  render();
}

function deleteTodo(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  todos = todos.filter((t) => t.id !== id);
  render();
}

function toggleComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  render();
}

function render() {
  todoList.innerHTML = '';

  const filtered =
    currentFilter === '전체'
      ? todos
      : todos.filter((t) => t.category === currentFilter);

  filtered.forEach((todo) => {
    const li = document.createElement('li');
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
}

addBtn.addEventListener('click', addTodo);

filterArea.addEventListener('click', (event) => {
  const btn = event.target.closest('.filter-btn');
  if (!btn) return;

  currentFilter = btn.dataset.category;

  filterArea
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.toggle('active', b === btn));

  render();
});
