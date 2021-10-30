export { Controller };

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
    this.getTodos(this.view.renderView);
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