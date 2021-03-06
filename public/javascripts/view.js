export { View };

class View {
  constructor() {
    this.saveNewTodoBtn = document.querySelector('#saveNewTodoBtn');
    this.modal = document.querySelector('#addTodoModal');
    this.todoList = document.querySelector('#todoList');
    this.navContainer = document.querySelector('#navBtnContainer');
    this.sectionTitle = document.querySelector('#sectionTitle');
    this.mainBadge = document.querySelector('#main-badge-count');

    // Form elements
    this.form = document.querySelector('#modalForm');
    this.titleInput = this.form.querySelector('input');
    this.descTextearea = this.form.querySelector('textarea');
    this.dayOption = this.form.querySelector('#due_day');
    this.monthOption = this.form.querySelector('#due_month');
    this.yearOption = this.form.querySelector('#due_year');
    this.markCompleteBtn = this.form.querySelector('#markCompleteBtn');

    // Handlebars Tempaltes
    this.navButtonsTemplate = Handlebars.compile(document.querySelector('#nav-button-template').innerHTML);
    this.todoItemsTemplate = Handlebars.compile(document.querySelector('#todoLITemplate').innerHTML);
    
    // Tracks id of the last todo clicked
    this.lastTodoTitleClickedID = null;
    this.#bindTodoTitleClicked();
    this.#bindAddTodoBtnClicked();

    // Tracks last clicked nav button
    this.processedData = null;
    this.lastClickedNavId = 0;
    this.#bindNavTitleClicked();
  }

  renderView(todos) {
    this.processedData = View.processDataForTemplate(todos);

    this.#renderNav();
    this.#renderMain();
  }

  #renderMain() {
    let subData = this.processedData.find(obj => obj.id === this.lastClickedNavId);
    if (!subData) {
      this.lastClickedNavId = 0;
      subData = this.processedData.find(obj => obj.id === this.lastClickedNavId);
    }
  
    const list = this.todoItemsTemplate({todos: subData.todos});
    this.todoList.innerHTML = '';
    this.todoList.insertAdjacentHTML('afterbegin', list);
    this.mainBadge.innerHTML = (String(subData.count));
    this.sectionTitle.innerHTML = subData.title;
  }

  #renderNav() {
    const navBtns = this.navButtonsTemplate({sections: this.processedData});
    this.navContainer.innerHTML = '';
    this.navContainer.insertAdjacentHTML('afterbegin', navBtns);
    this.#addHoverToNavBtn();
  }

  bindTodoChange(addHandler, updateHandler) {
    // Modal form submission event listener
    this.form.addEventListener('submit', e => {
      e.preventDefault();

      const data = View.convertFormDataToJSON(new FormData(this.form));

      if (!this.lastTodoTitleClickedID) {
        if (this.titleInput.value.length < 3) {
          alert("You must enter a title at least 3 characters long");
        } else {
          this.lastTodoTitleClickedID = 0;
          this.lastClickedNavId = 0;
          addHandler(data);
          this.#dismissModal();
        }
      } else {
        updateHandler(this.lastTodoTitleClickedID, data);
        this.#dismissModal();
      }

      this.#clearForm()
    });

    // Modal 'Make Complete' button event listener
    this.markCompleteBtn.addEventListener('click', e => {
      e.preventDefault();

      const id = this.lastTodoTitleClickedID;

      if (id) {
        const data = JSON.stringify({completed : true});
        updateHandler(id, data);
        this.#dismissModal()
      } else {
        alert('Cannot mark as complete as item has not been created yet!');
      }
    });

    // todo.completed toggled on click event listener
    $('ul#todoList').on('click', 'a.todo-area', e => {    
      if (e.target instanceof HTMLInputElement) return;

      const a = e.currentTarget;
      const id = a.parentNode.getAttribute('data-id');
      const todoCompleted = a.firstElementChild.checked;

      if (todoCompleted) {
        updateHandler(id, JSON.stringify({completed: false}));
      } else {
        updateHandler(id, JSON.stringify({completed: true}));
      }
    });

    // todo.completed toggled on click of checkbox
    $('ul#todoList').on('change', '.todo-checkbox', e => {
      e.stopPropagation();
      
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
      handler(id);
    });
  }

  #bindTodoTitleClicked() {
    $(this.todoList).on('click', 'span', e => {
      e.stopPropagation();
 
      this.#clearForm();
      const li = e.currentTarget.parentNode.parentNode;
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

  #bindNavTitleClicked() {
    $('#navBtnContainer').on('click', 'button', e => {
      const id = e.currentTarget.getAttribute('data-id');
      this.lastClickedNavId = Number(id);
      this.#renderMain();
    });
  }

  // Sets lastTodoTitleClickedID to null so bindTotoChange calls correct handler
  #bindAddTodoBtnClicked() {
    document.querySelector('.add-todo-btn').addEventListener('click', e => {
      this.#clearForm();
      this.lastTodoTitleClickedID = null;
    });
  }

  #dismissModal() {
    $("[data-bs-dismiss=modal]").trigger({ type: "click" });
  }

  #addHoverToNavBtn() {
    const navElems = [...this.navContainer.children];
    if (this.lastClickedNavId === 0) {
      navElems[0].classList.add('active');
    }
  }

  #clearForm() {
    this.titleInput.value = '';
    this.descTextearea.value = '';
    this.dayOption.firstElementChild.selected = true;
    this.monthOption.firstElementChild.selected = true;
    this.yearOption.firstElementChild.selected = true;
  }

  static processDataForTemplate(todos) {
    // Create list of titles
    const sorted = [...todos];
    sorted.sort(View.compareTodos);
    const titles = [];
    sorted.forEach(todo => {
      const title = View.generateTitle(todo.month, todo.year);
      if (!titles.includes(title)) titles.push(title);
    });
    
    // Create subarrays
    let id = 0;
    const allTodos = titles.map(dateTitle => ({todos: [], title: dateTitle, count: 0, id: id += 1}));
    allTodos.unshift({todos: [], title: "All Todos", count: 0, id: 0});
    const completedId = id + 1;
    id += 1;
    let completedTodos = titles.map(dateTitle => ({todos: [], title: dateTitle, count: 0, id: id += 1}));
    completedTodos.unshift({todos: [], title: "Completed", count: 0, id: completedId});
  
    // Add todos to each object
    const allArr = allTodos.find(todo => todo.title === 'All Todos').todos;
    const completedArr = completedTodos.find(todo => todo.title === 'Completed').todos;
    sorted.forEach(todo => {
      const title = View.generateTitle(todo.month, todo.year);
      if (todo.completed) {
        allTodos.find(todo => todo.title === title).todos.push(todo);
        completedTodos.find(todo => todo.title === title).todos.push(todo);
        completedArr.push(todo);
        allArr.push(todo);
      } else {
        allTodos.find(todo => todo.title === title).todos.push(todo);
        allArr.push(todo);
      }
    });

    // Sort by uncompleted/completed for allTodos
    allTodos.forEach(obj => {
      const todoArr = obj.todos;
      const completedArr = todoArr.filter(todo => todo.completed);
      let unfinishedArr = todoArr.filter(todo => !todo.completed);
      unfinishedArr.push(...completedArr);
      obj.todos = unfinishedArr;
    });
  
    // Update count for each object
    allTodos.forEach(obj => obj.count = obj.todos.length);
    completedTodos.forEach(obj => obj.count = obj.todos.length);
  
    // Filter out objects with no todos from completedTodos
    completedTodos = completedTodos.filter(obj => obj.count > 0 || obj.title === 'Completed');
  
    allTodos.push(...completedTodos)
    return allTodos;
  }
  
  static generateTitle(month, year) {
    if (!month || !year) return 'No Due Date';
    return `${month}/${year.slice(2)}`;
  }
    
  static compareTodos(a, b) {
    const aMonth = Number(a.month);
    const aYear = Number(a.year);
    const bMonth = Number(b.month);
    const bYear = Number(b.year);
    
    if (aYear < bYear) {
      return -1;
    } else if (bYear < aYear) {
      return 1;
    } else if (aYear === bYear) {
      return aMonth - bMonth;
    } else {
      return 0;
    }
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