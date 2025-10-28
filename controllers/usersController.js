const {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  validateUserData,
  isEmailTaken,
} = require("../utils");

const getUsers = (req, res) => {
  try {
    const users = getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

const getUser = (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

const createUser = (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.email)
      payload.email = String(payload.email).trim().toLowerCase();

    const validationErrors = validateUserData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (isEmailTaken(payload.email)) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const newUser = addUser(payload);
    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Error creating user",
      });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

const updateUserController = (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.email !== undefined && payload.email !== null) {
      payload.email = payload.email
        ? String(payload.email).trim().toLowerCase()
        : payload.email;
    }

    const validationErrors = validateUserData(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (payload.email && isEmailTaken(payload.email, req.params.id)) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const updatedUser = updateUser(req.params.id, payload);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

const deleteUserController = (req, res) => {
  try {
    const deleted = deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserController,
  deleteUserController,
  healthCheck,
};
