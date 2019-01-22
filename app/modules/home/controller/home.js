var modules = require('../../../../config/modules');
var settings = require('../../../../config/settings');
var i18n = require('i18n');

var HomeController = {};

/*
 * @name: home
 * @Created on : 3 Oct, 2016
 * @Author     : PBirle
 * @desc: Display default home page 
 */
HomeController.home = function(req, res, next) {    
    res.render("home.html", {helloworld: "Hello World"});
    return;
};


module.exports = HomeController;
