export { Model };

class Model {

  constructor() { }

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


  async resetTodos() {
    const response = await fetch('/api/reset');
    this.onTodoListChanged();
    return response.status;
  }

}