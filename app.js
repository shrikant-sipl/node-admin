var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var i18n = require('i18n');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var nunjucks = require("nunjucks");
var path = require("path");

var settings = require(__dirname + '/config/settings');
var routes = require(__dirname + '/config/routes');
var modules = require(__dirname + '/config/modules');

var module_list = settings.installed_modules;
var module_router = modules.loadModules(module_list);
var module_views = modules.loadViews(module_list);

var passport = require('passport');

for (var i in settings.initializers) {
    require(__dirname + '/config/initializers/' + settings.initializers[i]);
}

var app = express();
var searchPath = [path.join(__dirname, '/app/views')];
for (var i in module_views) {
    searchPath.push(path.join(__dirname, module_views[i]));
}


var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(searchPath));
app.set('port', settings.port);

nunjucksEnv.express(app);
app.set('view engine', settings.view_engine);
app.set('view cache', settings.view_cache);


/* Multi language Supporting feature */
i18n.configure({
    /* setup some locales - other locales default to en silently */
    locales: settings.locales,
    defaultLocale: settings.defaultLocale,
    /* where to store json files - defaults to './locales' */
    directory: __dirname + settings.locales_dir,
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(methodOverride());
// you will need to use cookieParser to expose cookies to req.cookies
app.use(cookieParser());


app.use(session({
    secret: settings.cookie_secret,
    name: settings.cookie_name,
    //store: sessionStore,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
/*  i18n init parses req for language headers, cookies, etc.  */
app.use(i18n.init);

app.use(express.static(__dirname + '/' + settings.static_dir));
/*  Set default local from  the session  */
app.use(function(req, res, next) {
    if (req.session.locale) {
        i18n.setLocale(res.locals, req.session.locale);
        i18n.setLocale(req, req.session.locale);
        i18n.setLocale(res, req.session.locale);
    }
    next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* Setup all routings from all module here */
var handlers = module_router;
routes.setup(app, handlers);

/* catch 404 and forward to error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        error: {}
    });
});

app.use(errorHandler());
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
