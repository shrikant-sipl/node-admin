var express = require('express');
var multer = require("multer");
var lusca = require("lusca");

var utils = require("../../../config/utils");

var users = require("./controller/users");
var UserModel = require("./models/users");

function UsersRouter() {
    var router = new express.Router();

    router.get('/', users.getUsers);

    return router;
}

module.exports = UsersRouter();
