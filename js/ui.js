const recipes = document.querySelector('.recipes');

// Event listeners to enable side menu and form to show when selected
document.addEventListener('DOMContentLoaded', function() {
  // nav menu. M --> Materialize reference
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left'});
});

// Render recipe data
const renderRecipe = (data, id) => {
  const html = `
    <div class="card-panel recipe white row" data-id="${id}">
      <img src="/img/dish.png" alt="recipe thumb">
      <div class="recipe-details">
        <div class="recipe-title">${data.title}</div>
        <div class="recipe-ingredients">${data.ingredients}</div>
      </div>
      <div class="recipe-delete">
        <i class="material-icons" data-id="${id}">delete_outline</i>
      </div>
    </div>
  `;

  // Add recipes-html to the inner html of the recipes query selector
  recipes.innerHTML += html;
};