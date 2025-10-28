
const API_BASE_URL = "http://localhost:3000/api";

const userForm = document.getElementById("user-form");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const formTitle = document.getElementById("form-title");
const messageDiv = document.getElementById("message");
const loadingDiv = document.getElementById("loading");
const usersContainer = document.getElementById("users-container");
const emptyState = document.getElementById("empty-state");

let isEditMode = false;
let currentUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  setupEventListeners();
});

function setupEventListeners() {
  userForm.addEventListener("submit", handleFormSubmit);
  cancelBtn.addEventListener("click", resetForm);
  refreshBtn.addEventListener("click", loadUsers);
}

async function loadUsers() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const result = await response.json();
    displayUsers(result.data);
  } catch (error) {
    showMessage("Error loading users: " + error.message, "error");
  } finally {
    showLoading(false);
  }
}

function displayUsers(users) {
  usersContainer.innerHTML = "";

  if (users.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  users.forEach((user) => {
    const userCard = createUserCard(user);
    usersContainer.appendChild(userCard);
  });
}

function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";

  const createdAt = new Date(user.createdAt).toLocaleDateString();

  card.innerHTML = `
        <div class="user-info">
            <h3>👤 ${user.name}</h3>
            <p>📧 ${user.email}</p>
            ${user.age ? `<p>🎂 Age: <strong>${user.age}</strong></p>` : ""}
            <p>📅 Created: ${createdAt}</p>
        </div>
        <div class="user-actions">
            <button class="btn btn-edit" onclick="editUser(${user.id})">
                ✏️ Edit
            </button>
            <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                🗑️ Delete
            </button>
        </div>
    `;

  return card;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    age: parseInt(document.getElementById("age").value) || undefined,
  };

  try {
    let response;

    if (isEditMode) {
      response = await fetch(`${API_BASE_URL}/users/${currentUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } else {
      response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    }

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message, "success");
      userForm.reset();
      resetForm();
      loadUsers();
    } else {
      throw new Error(result.message || "Operation failed");
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function editUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to load user");
    }

    const result = await response.json();
    const user = result.data;

    document.getElementById("user-id").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("age").value = user.age || "";

    isEditMode = true;
    currentUserId = user.id;
    formTitle.textContent = "Edit User";
    submitBtn.textContent = "Update User";
    cancelBtn.style.display = "block";

    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    showMessage("Error loading user: " + error.message, "error");
  }
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message, "success");
      loadUsers();

      if (currentUserId === userId) {
        resetForm();
      }
    } else {
      throw new Error(result.message || "Delete failed");
    }
  } catch (error) {
    showMessage("Error deleting user: " + error.message, "error");
  }
}

function resetForm() {
  userForm.reset();
  document.getElementById("user-id").value = "";
  isEditMode = false;
  currentUserId = null;
  formTitle.textContent = "Add New User";
  submitBtn.textContent = "Add User";
  cancelBtn.style.display = "none";
  messageDiv.classList.add("hidden");
}

function showLoading(show) {
  if (show) {
    loadingDiv.classList.remove("hidden");
  } else {
    loadingDiv.classList.add("hidden");
  }
}

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove("hidden");

  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 3000);
}

window.editUser = editUser;
window.deleteUser = deleteUser;


