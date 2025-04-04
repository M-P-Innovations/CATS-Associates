const express = require("express")
const routes = express.Router()
const userController = require("../controller/users-controller")

routes.get("/", userController.getAllUsers);

routes.put("/", userController.updateUser);

routes.post("/", userController.getUser);

// routes.delete("/", userController.deleteUser);

module.exports = routes
