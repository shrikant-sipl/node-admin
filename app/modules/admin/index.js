var express = require('express');
var multer = require("multer");
var lusca = require("lusca");
var utils = require("../../../config/utils");
var admin = require("./controller/admin");


function AdminRouter() {
    var router = new express.Router();
    
    router.get('/', admin.home);
    router.post('/login', admin.login);
    router.get('/admin', admin.adminDashboard);
    router.get('/admin/reset', admin.resetPassword);
    router.post('/admin/change', admin.changePassword);
    router.get('/admin/users', admin.userListing);
    router.get('/admin/delete/:id', admin.deleteUser);
    router.get('/admin/edit/:id', admin.editUser);
    router.post('/admin/update', admin.updateUser);
    router.get('/admin/logout', admin.logout);
    return router;
}

module.exports = AdminRouter();
