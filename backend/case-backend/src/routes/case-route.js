const express = require("express")
const multer = require('multer')
const routes = express.Router()
const caseController = require("../controller/case-controller")
const documentController = require("../controller/document-controller")
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1000000000, files: 10 },
});

routes.get("/", caseController.listCases);

routes.put("/", caseController.updateCase);

routes.post("/", caseController.getCaseDetails);

routes.post("/form", caseController.getForm);

routes.post("/upload", upload.array("files", 10), documentController.uploadDocuments);

routes.get("/upload", documentController.createZipFile)

routes.get("/download",documentController.downloadDocuments);

module.exports = routes
