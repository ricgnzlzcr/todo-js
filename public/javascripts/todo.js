import { Model } from './model.js';
import { View } from './view.js';
import { Controller } from './controller.js';

Handlebars.registerHelper('validDate', function(month, year) {
  if (month && year) {
    return ` - ${month}/${year.slice(2)}`;
  } else {
    return ' - No Due Date';
  }
});

Handlebars.registerHelper('getHeading', function(title) {
  if (title === 'All Todos' || title === 'Completed') {
    return 'h4';
  } else {
    return 'h6';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const app = new Controller(new Model(), new View());
});


