var express = require('express');

var utils = require("../../../config/utils");

var homeController = require("./controller/home");

/*
 * @name: HomeRouter
 * @Created on : 3 Oct, 2016
 * @Author     : PBirle
 * @desc: Include all routings regarding home controller  
 */
function HomeRouter() {
    var router = new express.Router();
    router.get('/', homeController.home);
    return router;
}

module.exports = HomeRouter();
