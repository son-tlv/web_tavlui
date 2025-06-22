
const API_KEY = "a979e72e11e941a5b8e3a2313823f179";
const API_BASE_URL = "https://api.spoonacular.com/recipes";

let menuItems = [];
let updateTimer = 300;
let timerInterval;

const menuContainer = document.getElementById("menuContainer");
const btnContainer = document.getElementById("btnContainer");
const loading = document.getElementById("loading");
const loginForm = document.getElementById("loginForm");
const quizForm = document.getElementById("quizForm");
const recipeModal = new bootstrap.Modal(
  document.getElementById("recipeModal")
);
const timerElement = document.getElementById("timer");

document.addEventListener("DOMContentLoaded", function () {
  fetchMenuItems();
  initializeTimer();
  setupEventListeners();
});

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);

  quizForm.addEventListener("submit", handleQuiz);

  btnContainer.addEventListener("click", handleFilter);
}

function initializeTimer() {
  timerInterval = setInterval(() => {
    updateTimer--;
    timerElement.textContent = updateTimer;

    if (updateTimer <= 0) {
      fetchMenuItems();
      updateTimer = 300;
    }
  }, 1000);
}

async function fetchMenuItems() {
  try {
    loading.style.display = "block";
    menuContainer.innerHTML = "";

    const response = await fetch(
      `${API_BASE_URL}/complexSearch?apiKey=${API_KEY}&number=20&addRecipeInformation=true&fillIngredients=true&sort=random`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    menuItems = data.results.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary || "Delicious recipe with amazing flavors.",
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      dishTypes: recipe.dishTypes || ["main course"],
      cuisines: recipe.cuisines || ["international"],
    }));

    displayMenuItems(menuItems);
    createFilterButtons();
    loading.style.display = "none";
  } catch (error) {
    console.error("Error fetching menu items:", error);
    loading.innerHTML = `
              <div class="alert alert-warning" role="alert">
                  <i class="fas fa-exclamation-triangle"></i> 
                  Unable to load menu items. Please try again later.
              </div>`;
  }
}

function displayMenuItems(items) {
  const menuHTML = items
    .map(
      (item) => `
          <div class="col-lg-6 col-xl-4 mb-4">
              <article class="menu-item" data-id="${item.id}">
                  <img src="${item.image}" alt="${
        item.title
      }" class="photo" />
                  <div class="item-info">
                      <header>
                          <h4>${item.title}</h4>
                      </header>
                      <p class="item-text">
                          ${stripHtml(item.summary).substring(0, 100)}...
                      </p>
                      <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">
                              <i class="fas fa-clock"></i> ${
                                item.readyInMinutes
                              } min | 
                              <i class="fas fa-users"></i> ${
                                item.servings
                              } servings
                          </small>
                          <button class="view-recipe-btn" onclick="viewRecipe(${
                            item.id
                          })">
                              View Recipe
                          </button>
                      </div>
                  </div>
              </article>
          </div>
      `
    )
    .join("");

  menuContainer.innerHTML = menuHTML;
}

function createFilterButtons() {
  const categories = ["all"];
  menuItems.forEach((item) => {
    item.dishTypes.forEach((type) => {
      if (!categories.includes(type)) {
        categories.push(type);
      }
    });
  });

  const buttonsHTML = categories
    .map(
      (category) => `
          <button type="button" class="filter-btn ${
            category === "all" ? "active" : ""
          }" data-category="${category}">
              ${category}
          </button>
      `
    )
    .join("");

  btnContainer.innerHTML = buttonsHTML;
}

function handleFilter(e) {
  if (e.target.classList.contains("filter-btn")) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    e.target.classList.add("active");

    const category = e.target.dataset.category;
    const filteredItems =
      category === "all"
        ? menuItems
        : menuItems.filter((item) => item.dishTypes.includes(category));

    displayMenuItems(filteredItems);
  }
}

async function viewRecipe(recipeId) {
  try {
    document.getElementById("recipeModalBody").innerHTML = `
              <div class="text-center">
                  <div class="spinner-border text-warning" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>`;

    recipeModal.show();

    const response = await fetch(
      `${API_BASE_URL}/${recipeId}/information?apiKey=${API_KEY}`
    );
    const recipe = await response.json();

    document.getElementById("recipeModalLabel").textContent =
      recipe.title;
    document.getElementById("recipeModalBody").innerHTML = `
              <div class="row">
                  <div class="col-md-4">
                      <img src="${recipe.image}" alt="${
      recipe.title
    }" class="img-fluid rounded">
                  </div>
                  <div class="col-md-8">
                      <h5>Ingredients:</h5>
                      <ul>
                          ${recipe.extendedIngredients
                            .map((ing) => `<li>${ing.original}</li>`)
                            .join("")}
                      </ul>
                      <h5>Instructions:</h5>
                      <p>${stripHtml(
                        recipe.instructions ||
                          "Instructions not available."
                      )}</p>
                      <div class="mt-3">
                          <span class="badge bg-warning text-dark me-2">
                              <i class="fas fa-clock"></i> ${
                                recipe.readyInMinutes
                              } minutes
                          </span>
                          <span class="badge bg-info text-dark me-2">
                              <i class="fas fa-users"></i> ${
                                recipe.servings
                              } servings
                          </span>
                          <span class="badge bg-success text-dark">
                              <i class="fas fa-heart"></i> ${
                                recipe.aggregateLikes
                              } likes
                          </span>
                      </div>
                  </div>
              </div>
          `;
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    document.getElementById("recipeModalBody").innerHTML = `
              <div class="alert alert-danger" role="alert">
                  Unable to load recipe details. Please try again later.
              </div>`;
  }
}

function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  let isValid = true;

  if (username.length < 3) {
    document.getElementById("username").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("username").classList.remove("is-invalid");
    document.getElementById("username").classList.add("is-valid");
  }

  if (password.length < 6) {
    document.getElementById("password").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("password").classList.remove("is-invalid");
    document.getElementById("password").classList.add("is-valid");
  }

  if (isValid) {
    document.getElementById("loginStatus").innerHTML = `
              <div class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle"></i> Welcome back, ${username}! 
                  ${rememberMe ? "Your session will be remembered." : ""}
              </div>`;

    loginForm.reset();
    document.querySelectorAll(".form-control").forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
    });
  }
}

function handleQuiz(e) {
  e.preventDefault();

  const formData = new FormData(quizForm);
  const guacamoleAnswer = formData.get("guacamole");

  let score = 0;
  let feedback = [];


  if (guacamoleAnswer === "avocado") {
    score++;
    feedback.push(
      "Correct! Avocado is indeed the main ingredient in guacamole."
    );
  } else if (guacamoleAnswer) {
    feedback.push(
      "Not quite right. The main ingredient in guacamole is avocado."
    );
  }

  document.getElementById("quizResult").innerHTML = `
          <div class="alert alert-info" role="alert">
              <h5><i class="fas fa-trophy"></i> Quiz Results (Score: ${score}/1)</h5>
              ${feedback
                .map((item) => `<p class="mb-1">${item}</p>`)
                .join("")}
          </div>`;
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

window.viewRecipe = viewRecipe;