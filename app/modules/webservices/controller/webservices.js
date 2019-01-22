/*
 * @name       : WebController
 * @Created on : 18 Nov, 2016
 * @Author     : SIPL
 */
var async = require('async');
var modules = require('../../../../config/modules');
var settings = require('../../../../config/settings');
var WebModel = require("./../models/webservices");
var WebController = {};
var nodemailer = require('../../../../node_modules/nodemailer');
var smtpTransport = require('../../../../node_modules/nodemailer-smtp-transport');
var md5           = require("md5");
var isJSON = require('is-json');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
/*
 * @name       : register
 * @Created on : 21 Nov, 2016
 * @Author     : SIPL
 */
WebController.register = function(req, res) { 
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var deviceToken = req.body.deviceToken;
    var deviceType = req.body.deviceType;
    var password = md5(req.body.password);
    if(firstName!='' && email!='' && password!='' && lastName!='' && deviceType!=''){
        WebModel.user.findOne({'email': email}, function(err, userExist){
            if(userExist!= null){
                res.json({'status': false,'message':'Email address is already in use.'});
            }else{
                var newUser = new WebModel.user({ firstName: firstName,lastName: lastName, email: email,password: password, role:3, status:1, gender:'', ethnicity:'', phone: '', deviceToken: deviceToken, deviceType: deviceType});
                WebModel.user.create(newUser, function(err, registerData) {
                    if(err) { return handleError(res, err); }
                    else{
                        var finalUserDeatils = { 'firstName': registerData.firstName,'lastName': registerData.lastName, 'email': registerData.email,'role': registerData.role,'userId':registerData._id};
                        return res.json({'status': true,'message':'You have registered successfully.','registeredUserDetails':finalUserDeatils});
                    }
                });
            }
        });
    }else{
        res.json({'status': false,'message':'Input parameter is missing.'});
    }
};

/*
 * @name       : login
 * @Created on : 21 Nov, 2016
 * @Author     : SIPL
 */
WebController.login = function(req, res) { 
    var email = req.body.email;
    var password = req.body.password;
    var deviceToken = req.body.deviceToken;
    if(email!='' && password!=''){
        passwordVerification(req, res);
    }else{
        res.json({'status': false,'message':'Input parameters is missing.'});
    }
};

/*
 * @name       : passwordVerification
 * @Created on : 21 Nov, 2016
 * @Author     : SIPL
 */
function passwordVerification(req, res){
    var email = req.body.email;
    var password = md5(req.body.password);
    var deviceTokenNew = req.body.deviceToken;
    
    WebModel.user.findOne({'email': email},{email:1, 'password': 1,'firstName':1,'lastName':1,'role':1, deviceToken:1}, function(err, userData){
         if(userData!= null){
            if(err) { return handleError(res, err); } 
            var mainUserId = userData._id;
            WebModel.diagnosis.findOne({'userId':userData._id,'diagnosisStatus': 'incompleted'},{_id:1}, function(err, diagnosisData){
                console.log("ddddd==>" + diagnosisData);
               if(err) { return handleError(res, err); }
                   if(diagnosisData!= null){
                       var finalUserDeatils = { 'firstName': userData.firstName,'lastName': userData.lastName, 'email': userData.email,'role': userData.role,'userId':userData._id,'diagnosisId': diagnosisData._id};
                   }else{ console.log('no diagnosis data');
                       var finalUserDeatils = { 'firstName': userData.firstName,'lastName': userData.lastName, 'email': userData.email,'role': userData.role,'userId':userData._id};
                   }

                   if (password == userData.password) { console.log('in true cond');
                       var tokens = userData.deviceToken;
                       console.log("tokens=>" + tokens);
                       console.log("deviceTokenNew=>" + deviceTokenNew);
                       if(tokens != '' && deviceTokenNew !=''){
                       if (tokens.indexOf(deviceTokenNew) > -1) {
                           
                            WebModel.user.update({ email: email}, function (err, result) {
                                if(err){
                                    res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                                }else{
                                    res.json({ 'status': true, 'message': 'You have logged-in successfully', 'userDetails': finalUserDeatils});
                                }
                            });
                       } else {  
                           tokens.push(deviceTokenNew);
                           WebModel.user.update({ email: email}, {deviceToken: tokens}, function (err, result) {
                               if(err){
                                   res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                               }else{
                                   res.json({ 'status': true, 'message': 'You have logged-in successfully', 'userDetails': finalUserDeatils});
                               }
                           });
                       }
                       }else{
                            res.json({ 'status': true, 'message': 'You have logged-in successfully', 'userDetails': finalUserDeatils});
                       }
                   }else{
                       res.json({'status': false,'message':'Invalid password.'});
                   }

           });
         }else{
            res.json({'status': false,'message':'Invalid login details.'});
         }
    });
}

/*
 * @name       : logout
 * @Created on : 21 Nov, 2016
 * @Author     : SIPL
 */
WebController.logout = function(req, res) {
    var userToUpdateId = req.body.userId;
    var deviceTokenNeedToDel = req.body.deviceToken;
    if(userToUpdateId!=''){
        WebModel.user.findOne({_id: userToUpdateId},{ deviceToken:1 }, function(err, tokenArray){   
            var tokens = tokenArray.deviceToken;
            var index = tokens.indexOf(deviceTokenNeedToDel);
            if ( index > -1) { 
                tokens.splice(index, 1);
                WebModel.user.update({_id: userToUpdateId}, {deviceToken: tokens}, function (err, result) {
                    if(err){
                        res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        res.json({ 'status': true, 'message': 'Logout successfully.'});
                    }
                });
            }else{
                res.json({ 'status': true, 'message': 'Logout successfully.'});
            } 
        });
    }else{
        res.json({'status': false,'message':'Input is missing.'});
    }
};

/*
 * @name       : forgot
 * @Created on : 22 Nov, 2016
 * @Author     : SIPL
 */
WebController.forgot = function(req, res) { 
    var email = req.body.email;
    if(email!= ''){
        WebModel.user.findOne({'email': email}, function(err, userData){
            if(userData!= null){
                var randomPasswordString = Math.random().toString(36).slice(-8);
                var transporter = nodemailer.createTransport(smtpTransport({
                    host : 'smtp.gmail.com',
                    SMTPAuth: true,
                    SMTPSecure: 'tls',
                    port: 587,
                    auth : {
                        user : "raghbendra_sipl@systematixindia.com",
                        pass : "target@2015"
                    }
                }));

                var mailOptions = {
                    from: "Oftalmic Admin <raghbendra_sipl@systematixindia.com>",
                    to: email,
                    subject: "New password",
                    text: "Password: " + randomPasswordString
                }
    /* Send email*/
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        res.json({'status': false,'message':error});
                    }else{
                        WebModel.user.update({ email: email}, {password: md5(randomPasswordString)}, function (err, result) {
                            if(err){
                                res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                            }else{
                                res.json({'status': true,'message':"Your new password has been sent to your provided email address."});
                            }
                        });
                    }
                });
            }else{
                res.json({'status': false,'message':'The email address you provided does not match our records. Please try again.'});
            }
        });
    }else{
        res.json({'status': false,'message':'Input is missing'});
    }
};

/*
 * @name       : contactUs
 * @Created on : 26 Nov, 2016
 * @Author     : SIPL
 */
WebController.contactUs = function(req, res) { 
    var requestType = req.body.requestType;
    var userId = req.body.userId;
    var message = req.body.message;
    if(requestType!= '' && message!= '' && userId!= ''){
        var transporter = nodemailer.createTransport(smtpTransport({
            host : 'smtp.gmail.com',
            SMTPAuth: true,
            SMTPSecure: 'tls',
            port: 587,
            auth : {
                user : "raghbendra_sipl@systematixindia.com",
                pass : "target@2015"
            }
        }));

        var mailOptions = {
            from: "Oftalmic Admin <raghbendra_sipl@systematixindia.com>",
            to: 'yashraj.chouhan@systematixindia.com',// Admin email address
            subject: "Contact Us",
            text: "Contact Type: " + requestType + ", " + "Message: " + message 
        }
        /* Send email*/
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                res.json({'status': false,'message':error});
            }else{
                var contactData = new WebModel.contact({ requestType: requestType, message: message, userId: userId});
                WebModel.contact.create(contactData, function(err, contactData) {
                    if(err) { return handleError(res, err); }
                    else{ 
                        res.json({'status': true,'message':"Thank you for contacting us. We will respond to you as soon as possible."});
                    }
                });
            }
        });
    }else{
        res.json({'status': false,'message':'Input is missing'});
    }
};

/*
 * @name       : settings
 * @Created on : 26 Dec, 2016
 * @Author     : SIPL (R)
 */
WebController.settings = function(req, res) { 
    var updateToUserId = req.body.userId;
    var notification = req.body.notification;
    var reminder = req.body.reminder;
    var getSetting = req.body.getSetting;
    if(getSetting!=''){
        WebModel.user.find({ _id: updateToUserId}, { notification:1,reminder:1}, function (err, settingsData) {
            if(err){
                res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
            }else{
                res.json({ 'status': true, 'settingsData': settingsData});
            }
        });
    }else if(notification!='' && reminder!=''){
        WebModel.user.update({ _id: updateToUserId}, { notification: notification,reminder: reminder}, function (err, result) {
            if(err){
                res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
            }else{
                res.json({ 'status': true, 'message': 'Setting updated successfully.'});
            }
        });
    }
};

/*
 * @name       : getProfileData
 * @Created on : 19 Dec, 2016
 * @Author     : SIPL
 */
WebController.getProfileData = function(req, res) { 
    var loggedUserId = req.body.userId;
        WebModel.user.find({'_id': loggedUserId},{email:1,firstName:1, lastName:1, gender:1, phone:1,ethnicity:1},function (err, profileData) {
            if(err) {
                return handleError(res, err);
            }else{
                return res.json({'status': true,'profileData':profileData});
            }
        });
};

/*
 * @name       : updateProfile
 * @Created on : 26 Nov, 2016
 * @Author     : SIPL
 */
WebController.updateProfile = function(req, res) { 
    var updateToUserId = req.body.userId;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var ethnicity = req.body.ethnicity;
    var password = req.body.password;
    var gender = req.body.gender;
    var phone = req.body.phone; 
    
    if(firstName!='' && lastName!='' && password!='' && updateToUserId!=''){ 
        var password = md5(password);
        WebModel.user.update({ _id: updateToUserId}, { firstName: firstName,lastName: lastName, gender: gender, password:password, phone: phone, ethnicity:ethnicity }, function (err, result) {
            if(err){
                res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
            }else{
                res.json({ 'status': true, 'message': 'Profile updated successfully.'});
            }
        });
    }else if(firstName!='' && lastName!='' && updateToUserId!=''){
        WebModel.user.update({ _id: updateToUserId}, { firstName: firstName,lastName: lastName, gender: gender, phone: phone,ethnicity:ethnicity}, function (err, result) {
            if(err){
                res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
            }else{
                res.json({ 'status': true, 'message': 'Profile updated successfully.'});
            }
        });
    }else{
        res.json({'status': false,'message':'Input is missing'});
    }
};
/*
 * @name       : getRelatives
 * @Created on : 18 Nov, 2016
 * @Author     : SIPL
 */
WebController.getRelatives = function(req, res) { 
    WebModel.relative.find({},function (err, relatives) {
        if(err) {
            return handleError(res, err);
        }else{
            var relativelList = [];
            for (var i=0; i < relatives.length; i++) {
                relativelList.push(relatives[i].name);
            }
            return res.json({'status': true,'relativeList':relativelList});
        }
    });
};

/*
 * @name       : getVisualAcuity
 * @Created on : 18 Nov, 2016
 * @Author     : SIPL
 */
WebController.getVisualAcuity = function(req, res) { 
    WebModel.visual.find({},function (err, visualAcuityList) {
        if(err) {
            return handleError(res, err);
        }else{
            var visualList = [];
            for (var i=0; i < visualAcuityList.length; i++) {
                visualList.push(visualAcuityList[i].visualAcuity);
            }
            return res.json({'status': true,'visualAcuityList':visualList});
        }
    });
};
/*
 * @name       : OpticNerveDiskList
 * @Created on : 24 Nov, 2016
 * @Author     : SIPL
 */
WebController.opticNerveDiskList = function(req, res) { 
    WebModel.Optic.find({},function (err, opticNerveList) {
        if(err) {
            return handleError(res, err);
        }else{
            var opticNervList = [];
            for (var i=0; i < opticNerveList.length; i++) {
                opticNervList.push(opticNerveList[i].name);
            }
            return res.json({'status': true,'OpticList':opticNervList});
        }
    });
};

/*
 * @name       : maculasList
 * @Created on : 26 Nov, 2016
 * @Author     : SIPL
 */
WebController.maculasList = function(req, res) { 
    WebModel.macula.find({},function (err, maculasList) {
        if(err) {
            return handleError(res, err);
        }else{
            var maculaList = [];
            for (var i=0; i < maculasList.length; i++) {
                maculaList.push(maculasList[i].name);
            }
            return res.json({'status': true,'maculasList':maculaList});
        }
    });
};

/*
 * @name       : bloodVessels
 * @Created on : 26 Nov, 2016
 * @Author     : SIPL
 */
WebController.bloodVessels = function(req, res) { 
    WebModel.vessel.find({},function (err, vesselsList) {
        if(err) {
            return handleError(res, err);
        }else{
            var vesselList = [];
            for (var i=0; i < vesselsList.length; i++) {
                vesselList.push(vesselsList[i].name);
            }
            return res.json({'status': true,'vesselsList':vesselList});
        }
    });
};

/*
 * @name       : peripheralList
 * @Created on : 26 Nov, 2016
 * @Author     : SIPL
 */
WebController.peripheralList = function(req, res) { 
    WebModel.peripheral.find({},function (err, peripheralList) {
        if(err) {
            return handleError(res, err);
        }else{
            var peripheralsList = [];
            for (var i=0; i < peripheralList.length; i++) {
                peripheralsList.push(peripheralList[i].name);
            }
            return res.json({'status': true,'peripheralList':peripheralsList});
        }
    });
};

/*
 * @name       : getDiseases
 * @Created on : 10 Jan, 2017
 * @Author     : SIPL (R)
 */
WebController.getDiseases = function(req, res) { 
    WebModel.diseases.find({},function (err, diseasesList) {
        if(err) {
            return handleError(res, err);
        }else{
            var diseaseList = [];
            for (var i=0; i < diseasesList.length; i++) {
                diseaseList.push(diseasesList[i].name);
            }
            return res.json({'status': true,'diseasesList':diseaseList});
        }
    });
};

/*
 * @name       : diagnosisPocessSaveData
 * @Created on : 29 Dec, 2016
 * @Author     : SIPL
 */
WebController.diagnosisPocessSaveData = function(req, res) { 
    var screenCode = req.body.screenCode;
    var userId = req.body.userId;
    var screensArray1 = req.body.screensArray;
    var screensArray = JSON.parse(screensArray1);
    
    var updateToDiagnosisId = req.body.diagnosisId;
    if(screenCode != null && screenCode!= 'undefined'){
        switch(screenCode){
            case 'E.q.WhoUser':
                var selfHave = req.body.selfHave;
                var userRelative = req.body.userRelative;
                var relativeName = req.body.relativeName;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { selfHave: selfHave, userRelative: userRelative, relativeName: relativeName, screenCode: screenCode,screensArray:screensArray }, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records updated successfully.'});
                        }
                    });
                }else{
                    var firstScreenData = new WebModel.diagnosis({ userId: userId, selfHave: selfHave, userRelative: userRelative, relativeName: relativeName, screenCode: screenCode,screensArray:screensArray });
                    WebModel.diagnosis.create(firstScreenData, function(err, firstScreenData) {
                        if(err) { 
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }
                        else{
                            res.json({'status': true,'message': 'Records added successfully.', 'InsertedData': firstScreenData});
                        }
                    });
                }
                break;
            case 'E.p.Age':
                var dateOfBirth = req.body.dateOfBirth;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { dateOfBirth: dateOfBirth, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.p.Gender':
                var gender = req.body.gender;
                var otherGenderText = req.body.otherGenderText;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { gender: gender, otherGenderText: otherGenderText, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.p.Ethnicity':
                var ethnicity = req.body.ethnicity; 
                var otherEthnicity = req.body.otherEthnicity;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { ethnicity: ethnicity, otherEthnicity: otherEthnicity, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'W.02':
                var knowDiagnosis = req.body.knowDiagnosis;
                var diagnosisName = req.body.diagnosisName;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { knowDiagnosis: knowDiagnosis, diagnosisName: diagnosisName, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'W.03':
                var eyePartName = req.body.eyePartName;
                var syndromeOcular = req.body.syndromeOcular;
                var dontKnowExactPartOfEye = req.body.dontKnowExactPartOfEye;
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { eyePartName: eyePartName, syndromeOcular: syndromeOcular, dontKnowExactPartOfEye: dontKnowExactPartOfEye, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.q.Genealogy':
                var bloodRelatedPersonInFamily = req.body.bloodRelatedPersonInFamily;
                var nameOfPersonsInFamily1 = req.body.nameOfPersonsInFamily;
                if(nameOfPersonsInFamily1 ){
                    var nameOfPersonsInFamily = JSON.parse(nameOfPersonsInFamily1);
                }else{
                    var nameOfPersonsInFamily = '';
                }
                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { bloodRelatedPersonInFamily: bloodRelatedPersonInFamily, nameOfPersonsInFamily: nameOfPersonsInFamily, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.g.Inheritance-type':
                var typeOfInheritance = req.body.typeOfInheritance;
                var typeOfInheritanceOtherText = req.body.typeOfInheritanceOtherText;
                if(typeof req.files != "undefined" || req.files != null){ 
                    var typeOfInheritanceImage = req.files[0].filename;
                }else{
                    var typeOfInheritanceImage = '';
                }

                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { typeOfInheritance: typeOfInheritance, typeOfInheritanceOtherText: typeOfInheritanceOtherText,typeOfInheritanceImage:typeOfInheritanceImage, screenCode: screenCode,screensArray:screensArray }, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.a.Visus': 
                var leftEyeMeasureVisualAcuity = req.body.leftEyeMeasureVisualAcuity;
                var rightEyeMeasureVisualAcuity = req.body.rightEyeMeasureVisualAcuity;
                var leftEyeMeasureVisualSee = req.body.leftEyeMeasureVisualSee;
                var leftEyeMeasureVisualNotSee = req.body.leftEyeMeasureVisualNotSee;
                var rightEyeMeasureVisualSee = req.body.rightEyeMeasureVisualSee;
                var rightEyeMeasureVisualNotSee = req.body.rightEyeMeasureVisualNotSee;
                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeMeasureVisualAcuity: leftEyeMeasureVisualAcuity,rightEyeMeasureVisualAcuity: rightEyeMeasureVisualAcuity,leftEyeMeasureVisualSee:leftEyeMeasureVisualSee,leftEyeMeasureVisualNotSee:leftEyeMeasureVisualNotSee,rightEyeMeasureVisualSee:rightEyeMeasureVisualSee,rightEyeMeasureVisualNotSee:rightEyeMeasureVisualNotSee,screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.a.Refraction':
                var leftEyeRefractionMeasurement = req.body.leftEyeRefractionMeasurement;
                var rightEyeRefractionMeasurement = req.body.rightEyeRefractionMeasurement;
                var refractionMeasurementDontHave = req.body.refractionMeasurementDontHave;
                var imagesArray = [];
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var imagesTestRefractionMeasurement = req.files[i].filename;
                            imagesArray.push(imagesTestRefractionMeasurement);
                        }
                    }else if(typeof req.files[0] != "undefined" || req.files[0] != null){
                        imagesArray.push(req.files[0].filename);
                    }
                }
                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeRefractionMeasurement: leftEyeRefractionMeasurement,rightEyeRefractionMeasurement: rightEyeRefractionMeasurement,refractionMeasurementDontHave:refractionMeasurementDontHave,screenCode: screenCode,imagesTestRefractionMeasurement: imagesArray,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.n.IOP':
                var leftEyeIntraocularPressureIOP = req.body.leftEyeIntraocularPressureIOP;
                var leftEyeIntraocularPressureMethod = req.body.leftEyeIntraocularPressureMethod;
                var rightEyeIntraocularPressureIOP = req.body.rightEyeIntraocularPressureIOP;
                var rightEyeIntraocularPressureMethod = req.body.rightEyeIntraocularPressureMethod;
                var leftEyeIntraocularPressureOthr = req.body.leftEyeIntraocularPressureOthr;
                var rightEyeIntraocularPressureOthr = req.body.rightEyeIntraocularPressureOthr;

                
                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeIntraocularPressureIOP: leftEyeIntraocularPressureIOP, leftEyeIntraocularPressureMethod: leftEyeIntraocularPressureMethod,rightEyeIntraocularPressureIOP: rightEyeIntraocularPressureIOP, rightEyeIntraocularPressureMethod: rightEyeIntraocularPressureMethod,leftEyeIntraocularPressureOthr: leftEyeIntraocularPressureOthr, rightEyeIntraocularPressureOthr: rightEyeIntraocularPressureOthr, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.n.Perimetry':
                var leftEyeMeasuredOptions1 = req.body.leftEyeMeasuredOptions;
                var rightEyeMeasuredOptions1 = req.body.rightEyeMeasuredOptions;
                
                var leftEyeMeasuredOptions = JSON.parse(leftEyeMeasuredOptions1);
                var rightEyeMeasuredOptions = JSON.parse(rightEyeMeasuredOptions1);
                var leftEyeMeasuredNoImage = req.body.leftEyeMeasuredNoImage;
                var leftEyeMeasuredOther = req.body.leftEyeMeasuredOther;
                var rightEyeMeasuredNoImage = req.body.rightEyeMeasuredNoImage;
                var rightEyeMeasuredOther = req.body.rightEyeMeasuredOther;
                var leftEyeMeasuredPerimetry1 = req.body.leftEyeMeasuredPerimetry;
                var rightEyeMeasuredPerimetry1 = req.body.rightEyeMeasuredPerimetry;
                var leftEyeMeasuredPerimetry = JSON.parse(leftEyeMeasuredPerimetry1);
                var rightEyeMeasuredPerimetry = JSON.parse(rightEyeMeasuredPerimetry1);

                var visualImagesArray = [];
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var eyeMeasuredVisualImages = req.files[i].filename;
                            visualImagesArray.push(eyeMeasuredVisualImages);
                        }
                    }else if(typeof req.files != "undefined" || req.files != null){ 
                        visualImagesArray.push(req.files.filename);
                    }
                }
                
                if(updateToDiagnosisId !=''){ 
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, {leftEyeMeasuredOptions:leftEyeMeasuredOptions,rightEyeMeasuredOptions:rightEyeMeasuredOptions,leftEyeMeasuredNoImage:leftEyeMeasuredNoImage,leftEyeMeasuredOther:leftEyeMeasuredOther, rightEyeMeasuredNoImage:rightEyeMeasuredNoImage,rightEyeMeasuredOther:rightEyeMeasuredOther, leftEyeMeasuredPerimetry: leftEyeMeasuredPerimetry, rightEyeMeasuredPerimetry: rightEyeMeasuredPerimetry, screenCode: screenCode, leftEyeMeasuredPerimetryImages: visualImagesArray,rightEyeMeasuredPerimetryImages: visualImagesArray,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            //remove unwanted images 
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { leftEyeMeasuredPerimetryImages: {$regex: 'right' } } }, function (err, result) {
                    });
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { rightEyeMeasuredPerimetryImages: {$regex: 'left' } } }, function (err, result) {
                    });
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.q.Progression':
                var progressionVisionStablePart1 = req.body.progressionVisionStablePart1;
                var progressionVisionStablePart2 = req.body.progressionVisionStablePart2;
                var progressionVisionDeteriorates1 = req.body.progressionVisionDeteriorates;
                var progressionVisionDeteriorates = JSON.parse(progressionVisionDeteriorates1);
                var progressionVisionOther = req.body.progressionVisionOther;
                var progressionVisionRates = req.body.progressionVisionRates;
                
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { progressionVisionStablePart1: progressionVisionStablePart1,progressionVisionStablePart2: progressionVisionStablePart2,progressionVisionDeteriorates: progressionVisionDeteriorates,progressionVisionOther:progressionVisionOther,progressionVisionRates: progressionVisionRates, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.r.Fundus':
                var leftEyeFundusExam = req.body.leftEyeFundusExam;
                var rightEyeFundusExam = req.body.rightEyeFundusExam;
                var fundusExamDontHaveImages = req.body.fundusExamDontHaveImages;
                var fundusImagesArray = [];
                console.log(req.files);
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var eyeMeasuredFundusImages = req.files[i].filename;
                            fundusImagesArray.push(eyeMeasuredFundusImages);
                        }
                    }else if(typeof req.files != "undefined" || req.files != null){ 
                        fundusImagesArray.push(req.files.filename);
                    }
                }
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeFundusExam: leftEyeFundusExam,rightEyeFundusExam: rightEyeFundusExam,fundusExamDontHaveImages:fundusExamDontHaveImages,leftEyeFundusExamImages:fundusImagesArray,rightEyeFundusExamImages:fundusImagesArray, screenCode: screenCode,screensArray:screensArray }, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            
                            //remove unwanted images 
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { leftEyeFundusExamImages: {$regex: 'right' } } }, function (err, result) {
                    });
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { rightEyeFundusExamImages: {$regex: 'left' } } }, function (err, result) {
                    });
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.r.OCT':
                var leftEyeCoherenceOctOptions1 = req.body.leftEyeCoherenceOctOptions;
                var rightEyeCoherenceOctOptions1 = req.body.rightEyeCoherenceOctOptions;
                var leftEyeCoherenceOctOptions = JSON.parse(leftEyeCoherenceOctOptions1);
                var rightEyeCoherenceOctOptions = JSON.parse(rightEyeCoherenceOctOptions1);
                var leftEyeCoherenceOctIhave = req.body.leftEyeCoherenceOctIhave;
                var leftEyeCoherenceOctOther = req.body.leftEyeCoherenceOctOther;
                var rightEyeCoherenceOctIhave = req.body.rightEyeCoherenceOctIhave;
                var coherenceOctDontHave = req.body.coherenceOctDontHave;
                var rightEyeCoherenceOctOther = req.body.rightEyeCoherenceOctOther;
                
                var leftEyeCohrncOctMeasurement1 = req.body.leftEyeCohrncOctMeasurement;
                var rightEyeCohrncOctMeasurement1 = req.body.rightEyeCohrncOctMeasurement;
                var leftEyeCohrncOctMeasurement = JSON.parse(leftEyeCohrncOctMeasurement1);
                var rightEyeCohrncOctMeasurement = JSON.parse(rightEyeCohrncOctMeasurement1);
                var octCoherenceImagesArray = []; 
                
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var octCoherenceImages = req.files[i].filename;
                            octCoherenceImagesArray.push(octCoherenceImages);
                        }
                    }else if(typeof req.files != "undefined" || req.files != null){ 
                        octCoherenceImagesArray.push(req.files.filename);
                    }
                }
                
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeCoherenceOctOptions: leftEyeCoherenceOctOptions,leftEyeCoherenceOctIhave: leftEyeCoherenceOctIhave,leftEyeCoherenceOctOther:leftEyeCoherenceOctOther,rightEyeCoherenceOctOptions:rightEyeCoherenceOctOptions,rightEyeCoherenceOctIhave:rightEyeCoherenceOctIhave,coherenceOctDontHave:coherenceOctDontHave,rightEyeCoherenceOctOther:rightEyeCoherenceOctOther,leftEyeCohrncOctMeasurement:leftEyeCohrncOctMeasurement,rightEyeCohrncOctMeasurement:rightEyeCohrncOctMeasurement,leftEyeCoherenceOctImages:octCoherenceImagesArray,rightEyeCoherenceOctImages:octCoherenceImagesArray, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            //remove unwanted images 
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { leftEyeCoherenceOctImages: {$regex: 'right' } } }, function (err, result) {
                    });
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { rightEyeCoherenceOctImages: {$regex: 'left' } } }, function (err, result) {
                    });
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.r.ERG':
                var leftEyeErgRecordingStimulus1 = req.body.leftEyeErgRecordingStimulus;
                var rightEyeErgRecordingStimulus1 = req.body.rightEyeErgRecordingStimulus;
                var leftEyeErgRecordingStimulus = JSON.parse(leftEyeErgRecordingStimulus1);
                var rightEyeErgRecordingStimulus = JSON.parse(rightEyeErgRecordingStimulus1);
                var leftEyeErgRecordingOther = req.body.leftEyeErgRecordingOther;
                var rightEyeErgRecordingOther = req.body.rightEyeErgRecordingOther;
                var recordingErgDontHaveImages = req.body.recordingErgDontHaveImages;
                
                var recordingErgImagesArray = []; 
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var recordingErgImages = req.files[i].filename;
                            recordingErgImagesArray.push(recordingErgImages);
                        }
                    }else if(typeof req.files != "undefined" || req.files != null){ 
                        recordingErgImagesArray.push(req.files.filename);
                    }
                }
                
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeErgRecordingStimulus: leftEyeErgRecordingStimulus,rightEyeErgRecordingStimulus: rightEyeErgRecordingStimulus,recordingErgDontHaveImages:recordingErgDontHaveImages,leftEyeErgRecordingImages:recordingErgImagesArray,rightEyeErgRecordingImages:recordingErgImagesArray,leftEyeErgRecordingOther:leftEyeErgRecordingOther,rightEyeErgRecordingOther:rightEyeErgRecordingOther, screenCode: screenCode,screensArray:screensArray }, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            //remove unwanted images 
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { leftEyeErgRecordingImages: {$regex: 'right' } } }, function (err, result) {
                    });
                            WebModel.diagnosis.update({_id: updateToDiagnosisId}, {$pull : { rightEyeErgRecordingImages: {$regex: 'left' } } }, function (err, result) {
                    });
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.n.MRI':
                var leftEyeMRIDescription = req.body.leftEyeMRIDescription;
                var rightEyeMRIDescription = req.body.rightEyeMRIDescription;
                var mriImagesArray = [];
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var imagesMRIMeasurement = req.files[i].filename;
                            mriImagesArray.push(imagesMRIMeasurement);
                        }
                    }else if(typeof req.files[0] != "undefined" || req.files[0] != null){
                        mriImagesArray.push(req.files[0].filename);
                    }
                }
                
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { leftEyeMRIDescription: leftEyeMRIDescription,rightEyeMRIDescription: rightEyeMRIDescription, mriImages: mriImagesArray, screenCode: screenCode,screensArray:screensArray}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
            case 'E.g.Genetic-mutation':
                var geneticallyConfirm = req.body.geneticallyConfirm;
                var geneticallyImagesArray = [];
                if(typeof req.files != "undefined" || req.files != null){
                    if( req.files.length>0){
                        for(var i=0;i<req.files.length;i++){
                            var geneticallyImages = req.files[i].filename;
                            geneticallyImagesArray.push(geneticallyImages);
                        }
                    }else if(typeof req.files[0] != "undefined" || req.files[0] != null){
                        geneticallyImagesArray.push(req.files[0].filename);
                    }
                }
                
                if(updateToDiagnosisId !=''){
                    WebModel.diagnosis.update({ _id: updateToDiagnosisId}, { geneticallyConfirm: geneticallyConfirm, geneticallyConfirmImages: geneticallyImagesArray, screenCode: screenCode,screensArray:screensArray, diagnosisStatus:'completed'}, function (err, result) {
                        if(err){
                            res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            res.json({ 'status': true, 'message': 'Records added successfully.'});
                        }
                    });
                }else{
                    res.json({ 'status': false, 'message': 'Diagnosis Id is missing.'});
                }
                break;
                /////
            default:
                break;
        }
    }else{
        res.json({ 'status': false, 'message': 'Input missing.'});
    }
};

/*
 * @name       : nextPreviousScreens
 * @Created on : 19 Dec, 2016
 * @Author     : SIPL (R)
 */
var nextPreviousScreens =  function(req, cb){
    var screenCode = req.body.screenCode;
    //Code for getting current,previous and next screens
    WebModel.screens.find({'screenCode': screenCode},{screenCode:1,squence:1},function (err, screensData) {
        if(err) {
            return res.json({'status': false, 'message': 'Something went wrong please try again.'});
        }else{
            WebModel.screens.find({'squence': { $in: [ (screensData[0].squence - 1),(screensData[0].squence),(screensData[0].squence + 1)] }},{screenCode:1,squence:1},function (err, preNextScreenData) {
                var currentScreen = '';
                var previousScreen = '';
                var nextScreen = '';
                if(err) {
                    return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                }else{ 
                    if(screenCode == 'E.q.WhoUser'){
                       currentScreen = preNextScreenData[0].screenCode;
                       nextScreen = preNextScreenData[1].screenCode;
                    }else if(screenCode == 'E.g.Genetic-mutation'){
                       previousScreen = preNextScreenData[0].screenCode;
                       currentScreen = preNextScreenData[1].screenCode;
                    }else{
                       previousScreen = preNextScreenData[0].screenCode;
                       currentScreen = preNextScreenData[1].screenCode;
                       nextScreen = preNextScreenData[2].screenCode;
                    }
                    cb(null, {'previousScreen': previousScreen, 'currentScreen':currentScreen, 'nextScreen': nextScreen });
                }
            });
        }
    });
}

/*
 * @name       : lastUpdatedScreensArray
 * @Created on : 20 Dec, 2016
 * @Author     : SIPL (R)
 */
WebController.lastUpdatedScreensArray = function(req, res) {
    var currentUserId = req.body.userId;
    WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(currentUserId),'diagnosisStatus': 'incompleted'}, {screensArray:1},function (err, requestedData) {
        if(err) {
            return res.json({'status': false, 'message': 'Something went wrong please try again.'});
        }else{ //console.log(requestedData[0].screensArray); //screensArray
            if(requestedData!=''){
                return res.json({'status': true, 'screensArray': requestedData[0].screensArray});
            }
            else{
                 return res.json({'status': true, 'screensArray': []});
            }
        }
    });
}

/*
 * @name       : getDiagnosisData
 * @Created on : 30 Nov, 2016
 * @Author     : SIPL (R)
 */
WebController.getDiagnosisData = function(req, res) {
    var screenCode = req.body.screenCode;
    var mainUserId = req.body.userId;
    var userDiagnosisId = req.body.diagnosisId;

    if((screenCode!= '' && screenCode!= 'undefined') && (mainUserId!= '' && mainUserId!= 'undefined')){
        switch(screenCode){
            case 'E.q.WhoUser': 
                if(userDiagnosisId == 'undefined' || userDiagnosisId == ''){
                    WebModel.diagnosis.find({'userId':  mongoose.Types.ObjectId(mainUserId)}, {userId:1, selfHave:1, userRelative:1, relativeName:1,screensArray:1},function (err, currentDiagnosisData) { 
                        if(err){
                            return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            if(currentDiagnosisData == ''){
                                
                                //Code for sending screens sequence
                                nextPreviousScreens(req, function(err, screensData) {
                                    currentDiagnosisData = [{"screensArray":[]}];
                                    if (err) return handleError(err);
                                    return res.json({'status': true, 'noDataFlag': true, 'currentScreenData':currentDiagnosisData, 'message':'No records found.', 'screenSequence': screensData });
                                });
                            }else{
                                
                                //Code for sending screens sequence
                                nextPreviousScreens(req, function(err, screensData) {
                                    currentDiagnosisData = [{"screensArray":[]}];
                                    if (err) return handleError(err);
                                    return res.json({'status': true, 'noDataFlag': true, 'currentScreenData':currentDiagnosisData, 'message':'No records found.', 'screenSequence': screensData});
                                });
                            }
                        }
                    });
                }else{
                    WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), '_id': userDiagnosisId}, {userId:1, selfHave:1, userRelative:1, relativeName:1,screensArray:1},function (err, currentDiagnosisData) {
                        if(err){ 
                            return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    });
                }
                break;
            case 'E.p.Age':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {dateOfBirth:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].dateOfBirth == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.p.Gender':
                WebModel.diagnosis.find({'userId':mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {gender:1,otherGenderText:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].gender == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.p.Ethnicity':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {ethnicity:1,otherEthnicity:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].ethnicity == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'W.02':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {knowDiagnosis:1, diagnosisName:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].knowDiagnosis == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'W.03':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {eyePartName:1, dontKnowExactPartOfEye:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].eyePartName == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.q.Genealogy':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {bloodRelatedPersonInFamily:1, nameOfPersonsInFamily:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].bloodRelatedPersonInFamily == 'undefined'){                //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.g.Inheritance-type':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {typeOfInheritance:1, typeOfInheritanceOtherText:1,typeOfInheritanceImage:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].typeOfInheritance == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.a.Visus':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeMeasureVisualAcuity:1, rightEyeMeasureVisualAcuity:1,leftEyeMeasureVisualSee:1,leftEyeMeasureVisualNotSee:1,rightEyeMeasureVisualSee:1,rightEyeMeasureVisualNotSee:1,screensArray:1},function (err, currentDiagnosisData) { 
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeMeasureVisualAcuity == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            //Start font should not be greater than 48.
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'startFont':'48','endFont':'12','minusBy':'2','screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.a.Refraction':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeRefractionMeasurement:1, rightEyeRefractionMeasurement:1,imagesTestRefractionMeasurement:1,refractionMeasurementDontHave:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].refractionMeasurementDontHave == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.n.IOP':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeIntraocularPressureIOP:1, leftEyeIntraocularPressureMethod:1,leftEyeIntraocularPressureOthr:1,rightEyeIntraocularPressureIOP:1,rightEyeIntraocularPressureMethod:1,rightEyeIntraocularPressureOthr:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeIntraocularPressureIOP == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.n.Perimetry':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId }, {leftEyeMeasuredOptions:1,rightEyeMeasuredOptions:1,leftEyeMeasuredNoImage:1,leftEyeMeasuredOther:1,rightEyeMeasuredNoImage:1,rightEyeMeasuredOther:1,leftEyeMeasuredPerimetry:1, rightEyeMeasuredPerimetry:1,rightEyeMeasuredPerimetryImages: 1,leftEyeMeasuredPerimetryImages:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeMeasuredOther == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.q.Progression':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {progressionVisionStablePart1:1,progressionVisionStablePart2:1,progressionVisionDeteriorates:1,progressionVisionRates:1,progressionVisionOther:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].progressionVisionRates == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.r.Fundus':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeFundusExam:1,rightEyeFundusExam:1,fundusExamDontHaveImages:1,leftEyeFundusExamImages:1,rightEyeFundusExamImages:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].fundusExamDontHaveImages == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.r.OCT':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeCoherenceOctOptions:1,leftEyeCoherenceOctIhave:1,leftEyeCoherenceOctOther:1,rightEyeCoherenceOctOptions:1,rightEyeCoherenceOctIhave:1,coherenceOctDontHave:1,rightEyeCoherenceOctOther:1,leftEyeCohrncOctMeasurement:1,rightEyeCohrncOctMeasurement:1,leftEyeCoherenceOctImages:1,rightEyeCoherenceOctImages:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeCoherenceOctOther == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.r.ERG':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeErgRecordingStimulus:1,rightEyeErgRecordingStimulus:1,leftEyeErgRecordingImages:1,rightEyeErgRecordingImages:1,recordingErgDontHaveImages:1,leftEyeErgRecordingOther:1,rightEyeErgRecordingOther:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeErgRecordingOther == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.n.MRI':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {leftEyeMRIDescription:1,rightEyeMRIDescription:1,mriImages:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].leftEyeMRIDescription == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
            case 'E.g.Genetic-mutation':
                WebModel.diagnosis.find({'userId': mongoose.Types.ObjectId(mainUserId), _id: userDiagnosisId}, {geneticallyConfirm:1,geneticallyConfirmImages:1,screensArray:1},function (err, currentDiagnosisData) {
                    if(err) {
                        return res.json({'status': false, 'message': 'Something went wrong please try again.'});
                    }else{
                        if(typeof currentDiagnosisData[0].geneticallyConfirm == 'undefined'){
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true,'noDataFlag': true, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData });
                            });
                        }else{
                            //Code for sending screens sequence
                            nextPreviousScreens(req, function(err, screensData) {
                            if (err) return handleError(err);
                            return res.json({'status': true, 'noDataFlag': false, 'currentScreenData':currentDiagnosisData,'screenSequence': screensData});
                            });
                        }
                    }
                });
                 break;
                 //////////
            default:
                break;
        }
    }else{
        res.json({ 'status': false, 'message': 'Input missing.'});
    }
};



function handleError(res, err) {
    return res.json({ 'status': false, 'message': 'Something went wrong please try again.'});
}

/*
 * @name       : checkAccessToken
 * @Created on : 20 Dec, 2016
 * @Author     : SIPL (R)
 */
WebController.checkAccessToken = function(req, res, next) {
    //console.log(JSON.stringify(req.headers));
    //console.log(req.headers.accesstoken);
    var recievedToken = req.headers.accesstoken;
    var OriginalToken = '6bdc28052dc3a4c615bf6e5056e98687';
    if(OriginalToken!= '' && recievedToken!= ''){
        if( OriginalToken === recievedToken){
            next();
        }else{
            return res.json({'status': false, 'message': 'Token invalid'});
        }
    }
}


module.exports = WebController;
