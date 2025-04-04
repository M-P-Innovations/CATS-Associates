const express = require("express")
const routes = express.Router()
const multer = require('multer');
const caseRegisterController = require("../controller/case-register-controller")
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 1000000000, files: 10 },
  });

routes.post("/", upload.array("files", 10), caseRegisterController.registerCase);


module.exports = routes
