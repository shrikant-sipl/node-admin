var async = require('async');
var modules  = require('../../../../config/modules');
var settings = require('../../../../config/settings');
var md5      = require("md5");
var AdminModel = require("../../admin/models/admin");
var AdminController = {};
var moment = require('moment');

/*
 * @name       : home
 */ 
AdminController.home = function(req, res) { console.log(req.session.userId);
    if(req.session.userId != "undefined" && req.session.userId != null){
        res.redirect("/admin"); currentYear: (new Date()).getFullYear()
    }else{
        res.render("home",{ title: 'Login', loginMessage: req.flash('loginFail'), currentYear: (new Date()).getFullYear() });
    }
    
};

/*
 * @name       : adminDashboard
 */ 
AdminController.adminDashboard = function(req, res) {
    //console.log(req.session.userId);
    if(req.session.userId != "undefined" && req.session.userId != null){
        res.render("dashboard", { title: "Home", session: req.session, currentYear: (new Date()).getFullYear() });
    }else{
        res.redirect("/");
    }
    
};

/*
 * @name       : login
 */ 
AdminController.login = function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    if(email!='' && password!=''){
        passwordVerification(req, res);
    }else{
        req.flash('loginFail', 'Enter email and password.');
        res.redirect("/");
    }
};

/*
 * @name       : passwordVerification
 */
function passwordVerification(req, res){
    var email = req.body.email;
    var password = req.body.password;
    //var password = md5(req.body.password);
    AdminModel.user.findOne({'email': email },{email:1, 'password': 1,'firstName':1 }, function(err, userData){ 
        //console.log(userData);
         if(userData!= null){
            if (password == userData.password) {
                req.session.userId = userData._id;
                req.session.email = userData.email;
                req.session.userName = userData.firstName;
                res.redirect('/admin');
                //res.render("dashboard",{ loginSuccess: loginFail });
            }else{
                req.flash('loginFail', 'Invalid password.');
                res.redirect("/");
            }
         }else{
             req.flash('loginFail', 'Invalid email and password.');
             res.redirect("/");
         }
    });
}


/*
 * @name       : resetPassword
 */ 
AdminController.resetPassword = function(req, res) {
    if(req.session.userId != "undefined" && req.session.userId != null){
        res.render("reset",{title: 'Reset Password', session: req.session, passwordSucc: req.flash('passwordSucc'), passwordFail: req.flash('passwordFail'), passwordNotMatch: req.flash('passwordNotMatch') });
    }else{
        res.redirect("/");
    }
};

/*
 * @name       : changePassword
 */ 
AdminController.changePassword = function(req, res) {
    var newPassword = req.body.new_password;
    var cpassword = req.body.cpassword;
    var userId = req.session.userId;
    if(newPassword === cpassword ){
        AdminModel.user.update({ _id: userId}, {password: md5(newPassword)}, function (err, result) {
            if(err){
                console.log('');
                req.flash('passwordFail', 'Something went wrong please try again.');
                res.redirect("/admin/reset");
            }else{
                req.flash('passwordSucc', 'Your password has been reset successfully!');
                res.redirect("/admin/reset");
            }
        });
    }else{
        req.flash('passwordNotMatch', "These passwords don't match. Try again.");
        res.redirect("/admin/reset");
    }

};


/*
 * @name       : userListing
 */ 
AdminController.userListing = function(req, res) { console.log(req.session.userId);
    if(req.session.userId != "undefined" && req.session.userId != null){
        AdminModel.user.find({status: 1 }, {firstName:1, lastName:1, email:1}, function (err, userlList) { 
            if(err) {
                req.flash('deleted', 'Something went wrong please try again.');
                res.redirect('/admin/users');
            }else{
                res.render("users",{ title: 'Users', usersArray: userlList, session: req.session, deletedRecord: req.flash('deleted'), deletedError: req.flash('deletedError'), updateError: req.flash('updateError'), updateUserSucc: req.flash('updateUserSucc') });
               // console.log(userlList);
            }
        });
    }else{
        res.render("home",{ title: 'Login', loginMessage: req.flash('loginFail') });
    }
    
};

/*
 * @name       : editUser
 */ 
AdminController.editUser = function(req, res) { 
    if(req.session.userId != "undefined" && req.session.userId != null){
        AdminModel.user.find({'_id': req.params.id }, {firstName:1, lastName:1}, function (err, userRecord) { 
            if(err) {
                req.flash('deleted', 'Something went wrong please try again.');
                res.redirect('/admin/users');
            }else{
                res.render("usersEdit",{ title: 'Edit User', usersData: userRecord, session: req.session });
            }
        });
    }else{
        res.render("home",{ title: 'Login', loginMessage: req.flash('loginFail') });
    }
};

/*
 * @name       : updateUser
 */ 
AdminController.updateUser = function(req, res) { 
    if(req.session.userId != "undefined" && req.session.userId != null){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var userToUpdateId = req.body.updateId;
        AdminModel.user.update({ _id: userToUpdateId }, {firstName:firstName, lastName:lastName}, function (err, result) { 
            if(err) {
                req.flash('updateError', 'Something went wrong please try again.');
                res.redirect('/admin/users');
            }else{
                req.flash('updateUserSucc', 'Record updated successfully.');
                res.redirect('/admin/users');}
        });
    }else{
        res.render("login",{ title: 'Login'});
    }
};

/*
 * @name       : deleteUser
 */ 
AdminController.deleteUser = function(req, res) { 
    if(req.session.userId != "undefined" && req.session.userId != null){
        AdminModel.user.find({'_id': req.params.id }, {firstName:1, lastName:1, email:1}, function (err, userData) { 
            if(err) {
                req.flash('deletedError', 'Something went wrong please try again.');
                res.redirect('/admin/users');
            }else{
                AdminModel.user.update({ _id: req.params.id }, { status: 0 }, function (err, result) {
                    if(err){
                        req.flash('deletedError', 'Something went wrong please try again.');
                        res.redirect('/admin/users');
                    }else{
                        req.flash('deleted', 'Record deleted successfully.');
                        res.redirect('/admin/users');
                    }
                });
            }
        });
    }else{
        res.render("home",{ title: 'Login', loginMessage: req.flash('loginFail') });
    }
    
};

/*
 * @name       : logout
 */ 

AdminController.logout = function(req, res) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
};

/*
 * @name       : handleError
 */ 

function handleError(res, err) {
    return res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
}

module.exports = AdminController;
