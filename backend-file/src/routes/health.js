const express = require("express")
const routes = express.Router()

routes.get("/", (req, res) => {
    res.status(200).json({
        message: 'Health OK'
    });
});

module.exports = routes