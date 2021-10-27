class Todo {
  constructor(id, title, day, month, year, completed, description) {
    this.id = id;
    this.title = title;
    this.day = day;
    this.month = month;
    this.year = year;
    this.completed = completed;
    this.description = description;
  }

  updateTodo(propValues) {
    const keys = Object.keys(propValues);
    keys.forEach(key => this[key] = propValues[key]);
  }

  copy() {
    const copy = {};
    const keys = Object.keys(this);
    keys.forEach(key => copy[key] = this[key]);
    return copy;
  }
}

class TodoList {
  #todos;

  constructor() {
    this.#todos = [];
  }

  addTodo(todo) {
    this.#todos.push(todo);
  }

  deleteTodo(id) {
    const idx = this.#todos.findIndex(todo => todo.id === id);
    this.#todos.splice(idx, 1);
  }

  updateTodo(id, propValues) {
    this.getTodo(id).updateTodo(propValues);
  }

  getTodo(id) {
    return this.#todos.find(todo => todo.id === id);
  }

  getAllTodos() {
    return this.#todos.map(todo => todo.copy());
  }

  resetList() {
    this.#todos = [];
  }
}

class Model {
  constructor() {}
}

class View {
  constructor() {}
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

const app = new Controller(new Model(), new View());

let todo = new Todo(1, "Finish project", "11", "11", "2021", false, "You need this for LS");
todo.updateTodo({description: "You can do this!"});

let todoList = new TodoList();
todoList.addTodo(todo);

debugger;