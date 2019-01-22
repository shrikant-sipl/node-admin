var async = require('async');
var modules = require('../../../../config/modules');
var settings = require('../../../../config/settings');


var UserController = {};

/*
 * @name       : HomeRouter
 * @Created on : 3 Oct, 2016
 * @Author     : PBirle
 * @desc       : Show all users here
 */
UserController.getUsers = function(req, res, next) {
    res.render("user_list", []);
    return;
};



module.exports = UserController;
