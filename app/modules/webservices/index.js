var express = require('express');
var multer = require('multer');

// Code for image upload using multer

//var storage = myCustomStorage({
//  destination: function (req, file, cb) {
//    cb(null, '/var/www/uploads/' + file.originalname)
//  }
//})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/uploads/diagnosis')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + file.originalname) //Appending .jpg
    //console.log(file.fieldname + '_' + Date.now() + file.originalname);
  }
});

var upload = multer({ storage: storage });
var lusca = require("lusca");
var utils = require("../../../config/utils");
var webservices = require("./controller/webservices"); 
function WebRouter() {
    var router = new express.Router();
    var cpUpload = upload.any();
    router.post('/diagnosis', webservices.checkAccessToken, cpUpload, webservices.diagnosisPocessSaveData);

    router.post('/register', webservices.register);
    router.post('/login', webservices.login);
    router.post('/forgot', webservices.forgot);
    router.post('/contact', webservices.contactUs);
    router.post('/logout', webservices.logout);
    
    router.get('/diseases', webservices.checkAccessToken, webservices.getDiseases);
    router.post('/getScreens', webservices.lastUpdatedScreensArray);
    router.post('/update',webservices.checkAccessToken, webservices.updateProfile);
    router.post('/profile',webservices.checkAccessToken, webservices.getProfileData);
    router.post('/settings',webservices.checkAccessToken, webservices.settings);
    router.post('/getDiagnosis', webservices.checkAccessToken, webservices.getDiagnosisData);
    router.get('/vessels', webservices.checkAccessToken, webservices.bloodVessels);
    router.get('/maculas', webservices.checkAccessToken, webservices.maculasList);
    router.get('/visuals', webservices.checkAccessToken, webservices.getVisualAcuity);
    router.get('/peripherals', webservices.checkAccessToken, webservices.peripheralList);
    router.get('/getRelatives',webservices.checkAccessToken, webservices.getRelatives);
    router.get('/opticNerves', webservices.checkAccessToken, webservices.opticNerveDiskList);
    return router;
}

module.exports = WebRouter();
