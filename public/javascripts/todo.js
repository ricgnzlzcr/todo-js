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
}

class TodoList {
  constructor() {
    this.todos = [];
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
todo.updateTodo({'#description': "You can do this!"});
debugger;