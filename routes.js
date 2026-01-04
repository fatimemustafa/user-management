const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUserController,
  deleteUserController,
  healthCheck,
} = require("./controllers/usersController");

// Health check endpoint
router.get("/health", healthCheck);

// User routes
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

module.exports = router;

