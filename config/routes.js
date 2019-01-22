var passport = require('passport');
var multer = require("multer");
var utils = require("./utils");
var modules = require("./modules");
var csrf = require('csurf');


module.exports.setup = function(app, handlers) {

    app.all('*', function(req, res, next) {
        var theme = req.query.theme || req.session.theme || 'United';
        req.session.theme = theme;
        app.locals.theme = req.session.theme;
        next();
    });

    /*
     *  Home Routings 
     */

    //app.get('/', modules.getModuleRoutes('home'));
    
    /**
     * Admin Routings
     */
    app.use('/', modules.getModuleRoutes('admin'));
    /**
     * User Routings
     */
    //app.use('/users', modules.getModuleRoutes('users'));

    /**
     * Webservices Routings
     */
    app.use('/webservices', modules.getModuleRoutes('webservices'));
    
    app.get('/:locale', function(req, res, next) {
        var locale = req.params.locale;
        if (locale == 'ru' || locale == 'en') {
            req.session.locale = req.params.locale;
            res.redirect('back');
            return;
        }
        next();
    });
};
