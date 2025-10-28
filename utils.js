const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "data.json");

function readData() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    return { users: [], nextId: 1 };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
}

function getAllUsers() {
  const data = readData();
  return data.users;
}

function getUserById(id) {
  const data = readData();
  return data.users.find((user) => user.id === parseInt(id));
}

function addUser(userData) {
  const data = readData();
  const newUser = {
    id: data.nextId,
    ...userData,
    email: userData.email
      ? String(userData.email).trim().toLowerCase()
      : userData.email,
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  data.nextId++;

  if (writeData(data)) {
    return newUser;
  }
  return null;
}

function updateUser(id, userData) {
  const data = readData();
  const userIndex = data.users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) {
    return null;
  }

  data.users[userIndex] = {
    ...data.users[userIndex],
    ...userData,
    email:
      userData.email !== undefined
        ? userData.email
          ? String(userData.email).trim().toLowerCase()
          : userData.email
        : data.users[userIndex].email,
    id: parseInt(id),
  };

  if (writeData(data)) {
    return data.users[userIndex];
  }
  return null;
}

function deleteUser(id) {
  const data = readData();
  const userIndex = data.users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) {
    return false;
  }

  data.users.splice(userIndex, 1);
  return writeData(data);
}

function validateUserData(userData) {
  const errors = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!userData.email || userData.email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push("Email format is invalid");
  }

  if (userData.age && (isNaN(userData.age) || userData.age < 0)) {
    errors.push("Age must be a positive number");
  }

  return errors;
}

// Check if an email is already used by another user
function isEmailTaken(email, excludeUserId) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  const data = readData();
  return data.users.some((u) => {
    const uEmail = u.email ? String(u.email).trim().toLowerCase() : "";
    if (excludeUserId !== undefined && excludeUserId !== null) {
      return uEmail === normalized && u.id !== parseInt(excludeUserId);
    }
    return uEmail === normalized;
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  validateUserData,
  isEmailTaken,
};
