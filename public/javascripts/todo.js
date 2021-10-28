

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

  async addTodo(title, day, month, year, completed, description) {
    const response = await fetch("api/todos", {
      method: "POST",
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

    // if (response.status === 201) this.updateTodoList();
    return response.status;
  }

  async deleteTodo(id) {
    const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    // if (response.status === 204) this.updateTodoList();
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

    // if (response.status === 200) this.updateTodoList();
    return response.status;
  }

  async resetTodos() {
    const response = await fetch('/api/reset');
    return response.status;
  }

  // async updateTodoList() {
  //   this.#todos = await this.getServerTodos();
  //   console.log(this.#todos);
  // }


  

}

class View {
  constructor() {
    this.todoList = document.querySelector('#todoList');
    this.todoItemsTemplate = Handlebars.compile(document.querySelector('#todoLITemplate').innerHTML);
  }

  displayTodos(todos) {
    const list = this.todoItemsTemplate({todos: todos});
    this.todoList.insertAdjacentHTML('afterbegin', list);
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged);

    // Display initial todos
    (async () => {
      let todos = await this.model.getAllTodos();
      this.onTodoListChanged(todos);
    })();
  }

  onTodoListChanged = todos => {
    this.view.displayTodos(todos);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Controller(new Model(), new View());
});


