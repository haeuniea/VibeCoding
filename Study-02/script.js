const todoInput = document.getElementById('todo-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

let todos = [];

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

function render() {
  todoList.innerHTML = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = `[${todo.category}] ${todo.title}`;

    const editBtn = document.createElement('button');
    editBtn.textContent = '수정';
    editBtn.addEventListener('click', () => editTodo(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(titleSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

addBtn.addEventListener('click', addTodo);
