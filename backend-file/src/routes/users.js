const express = require("express")
const routes = express.Router()
const userService = require("../service/users")

routes.get("/", userService.getAllUsers);

routes.put("/", userService.updateUser);

routes.post("/", userService.getUser);

routes.delete("/", userService.deleteUser);

module.exports = routes
