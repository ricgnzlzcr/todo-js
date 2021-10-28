Handlebars.registerHelper('validDate', function(month, year) {
  if (month && year) {
    return ` - ${month}/${year.slice(2)}`;
  } else {
    return ' - No Due Date';
  }
});

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

  async updateTodo(id, JSONTodo) {
    const response = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      body: JSONTodo,
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
    });

    if (response.status === 200) this.onTodoListChanged();
    return response.status;
  }

  // async markTodoComplete(id) {
  //   const data = JSON.stringify({completed : true});
  //   this.updateTodo(id, data);
  // }

  async resetTodos() {
    const response = await fetch('/api/reset');
    this.onTodoListChanged();
    return response.status;
  }

}

class View {
  constructor() {
    this.saveNewTodoBtn = document.querySelector('#saveNewTodoBtn');

    // Form elements
    this.form = document.querySelector('#modalForm');
    this.titleInput = this.form.querySelector('input');
    this.descTextearea = this.form.querySelector('textarea');
    this.dayOption = this.form.querySelector('#due_day');
    this.monthOption = this.form.querySelector('#due_month');
    this.yearOption = this.form.querySelector('#due_year');
    this.markCompleteBtn = this.form.querySelector('#markCompleteBtn');

    this.todoList = document.querySelector('#todoList');
    this.todoItemsTemplate = Handlebars.compile(document.querySelector('#todoLITemplate').innerHTML);
    
    // Tracks id of the last todo clicked
    this.lastTodoTitleClickedID = null;
    this.#bindTodoTitleClicked();
    this.#bindAddTodoBtnClicked();

  }

  displayTodos(todos) {
    console.log(todos);
    const completedTodos = todos.filter(todo => todo.completed);
    const sortedList = todos.filter(todo => !todo.completed);
    sortedList.push(...completedTodos);
 
    const list = this.todoItemsTemplate({todos: sortedList});
    this.todoList.innerHTML = '';
    this.todoList.insertAdjacentHTML('afterbegin', list);
  }

  bindTodoChange(addHandler, updateHandler) {
    this.form.addEventListener('submit', e => {
      e.preventDefault();

      const data = View.convertFormDataToJSON(new FormData(this.form));

      if (!this.lastTodoTitleClickedID) {
        addHandler(data);
      } else {
        updateHandler(this.lastTodoTitleClickedID, data);
      }

      this.#clearForm()
    });

    this.markCompleteBtn.addEventListener('click', e => {
      e.preventDefault();
      const id = this.lastTodoTitleClickedID;
      if (id) {
        const data = JSON.stringify({completed : true});
        updateHandler(id, data);
        // this.#crossOutText(id);
      } else {
        alert('Cannot mark as complete as item has not been created yet!');
      }
    });

    $('main').on('change', '.todo-checkbox', e => {
      const checkbox = e.currentTarget;
      const id = checkbox.parentNode.parentNode.getAttribute('data-id');
      if (checkbox.checked) {
        updateHandler(id, JSON.stringify({completed: true}));
      } else {
        updateHandler(id, JSON.stringify({completed: false}));
      }
    });
  }

  bindDeleteTodo(handler) {
    $(this.todoList).on('click', '.trashBtn', e => {
      e.preventDefault();
      const id = e.currentTarget.parentNode.getAttribute('data-id');
      //debugger;
      handler(id);
    });
  }

  // #crossOutText(id) {
  //   const span = document.querySelector(`li[data-id="${id}"] span`);
  //   span.classList.add('completed');
  // }

  #bindTodoTitleClicked() {
    $(this.todoList).on('click', 'li', e => {
      this.#clearForm();
      const li = e.currentTarget;
      this.lastTodoTitleClickedID = li.getAttribute('data-id');
      const title = li.getAttribute('data-title');
      const desc = li.getAttribute('data-description');
      const day = li.getAttribute('data-day');
      const month = li.getAttribute('data-month');
      const year = li.getAttribute('data-year');

      this.titleInput.value = title ? title : '';
      this.descTextearea.value = desc ? desc : '';

      if (day) this.dayOption.querySelector(`option[value="${day}"]`).selected = true;
      if (month) this.monthOption.querySelector(`option[value="${month}"]`).selected = true;
      if (year) this.yearOption.querySelector(`option[value="${year}"]`).selected = true;
    });
  }

  // Sets lastTodoTitleClickedID to null so bindTotoChange calls correct handler
  #bindAddTodoBtnClicked() {
    document.querySelector('.add-todo-btn').addEventListener('click', e => {
      this.#clearForm();
      this.lastTodoTitleClickedID = null;
    });
  }

  #clearForm() {
    this.titleInput.value = '';
    this.descTextearea.value = '';
    this.dayOption.firstElementChild.selected = true;
    this.monthOption.firstElementChild.selected = true;
    this.yearOption.firstElementChild.selected = true;
  }

  static convertFormDataToJSON(formData) {
    const object = {};
    formData.forEach((value, key) => {
      if ( (key === 'day' && value === 'Day')     || 
           (key === 'month' && value === 'Month') || 
           (key === "year" && value === 'Year')
          ) {
            value = '';
          }
      object[key] = value;
    });
    return JSON.stringify(object);
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindTodoChange(this.handleAddTodo, this.handleUpdateTodo);
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

  handleUpdateTodo = (id, todo) => {
    this.model.updateTodo(id, todo);
  }

  handleDeleteTodo = id => {
    this.model.deleteTodo(id);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Controller(new Model(), new View());
});


