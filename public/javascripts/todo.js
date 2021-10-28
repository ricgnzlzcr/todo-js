

class Model {

  constructor() {
    
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  async getTodo(id) {
    const response = await fetch(`/api/todos/${id}`);
    const todo = await response.json();
    return todo;
  }

  async getAllTodos() {
    const response = await fetch('/api/todos');
    const todos = await response.json();
    return todos;
  }

  async addTodo(JSONTodo) {
    const response = await fetch("api/todos", {
      method: "POST",
      body: JSONTodo,
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
    });

    if (response.status === 201) this.onTodoListChanged();
    return response.status;
  }

  async deleteTodo(id) {
    const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (response.status === 204) this.onTodoListChanged();
    return response.status;
  }

  async updateTodo(id, title, day, month, year, completed, description) {
    const response = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify({
          title: title,
          day: day,
          month: month,
          year: year,
          completed: completed,
          description: description
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
    });

    if (response.status === 200) this.onTodoListChanged();
    return response.status;
  }

  async resetTodos() {
    const response = await fetch('/api/reset');
    this.onTodoListChanged();
    return response.status;
  }

}

class View {
  constructor() {
    this.saveNewTodoBtn = document.querySelector('#saveNewTodoBtn');
    this.form = document.querySelector('#modalForm');
    this.todoList = document.querySelector('#todoList');
    this.todoItemsTemplate = Handlebars.compile(document.querySelector('#todoLITemplate').innerHTML);
    
  }

  displayTodos(todos) {
    console.log(todos);
    const list = this.todoItemsTemplate({todos: todos});
    this.todoList.innerHTML = '';
    this.todoList.insertAdjacentHTML('afterbegin', list);
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', e => {
      e.preventDefault();

      const data = View.convertFormDataToJSON(new FormData(this.form));
      handler(data);
    });
  }

  bindDeleteTodo(handler) {
    $(this.todoList).on('click', '.trashBtn', e => {
      e.preventDefault();

      const id = e.currentTarget.parentNode.getAttribute('data-id');
      handler(id);
    });
  }

  static convertFormDataToJSON(formData) {
    const object = {};
    formData.forEach((value, key) => object[key] = value);
    return JSON.stringify(object);
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);

    this.onTodoListChanged();
  }

  getTodos(handler) {
    (async () => {
      let todos = await this.model.getAllTodos();
      handler.call(this.view, todos);
    }).call(this);
  }

  onTodoListChanged = () => {
    this.getTodos(this.view.displayTodos);
  }

  handleAddTodo = todo => {
    this.model.addTodo(todo);
  }

  handleDeleteTodo = id => {
    this.model.deleteTodo(id);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Controller(new Model(), new View());
});


