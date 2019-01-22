var fs = require("fs");
var settings = require("./settings");

function getModuleDir(dir,cb){
    fs.readdir(dir,function(err, data){
           console.log(err);
           cb(data);
    });   
};

function getModuleDirSync(dir){
    return fs.readdirSync(dir);   
};

function loadModules(modules){
    var obj = {};
    obj['controllers'] = {};
    for(var i in modules){
        var module = modules[i];
        obj[module] = require('..' + settings.module_dir + module + '/controller/' + module);
        
    }
    return obj;
};

function loadViews(modules){
    var path = [];
    for(var i in modules){
        var module = modules[i];
        path.push( settings.module_dir  + module + '/views/');
    }
    return path;
};

function getModuleModel(name){
    return require('..' + settings.module_dir + '' + name + '/models/' + name);
};

function getModuleRoutes(name){
    return require('..' + settings.module_dir + '' + name + '/index');
};

module.exports = {
        getModuleDir: getModuleDir,
        loadModules: loadModules,
        getModuleDirSync: getModuleDirSync,
        loadViews: loadViews,
        getModuleModel: getModuleModel,
        getModuleRoutes:getModuleRoutes
};




