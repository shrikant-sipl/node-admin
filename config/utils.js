var _ = require('lodash');
var settings = require('./settings');


/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/account/login/');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};


exports.in_array = function(arr,val) {
    for(var i = 0, l = arr.length; i < l; i++)	{
        if(arr[i] == val) {
            return true;
        }
    }
    return false;
};

/**
 * use 
 * http://stackoverflow.com/questions/9609325/node-js-express-js-user-permission-security-model
 * app.get("/foo", foo.index);
 * app.get("/foo/:id", requireRole("user"), foo.show);
 * app.post("/foo", requireRole("admin"), foo.create);
 */
exports.requireRole = function(role) {
    return function(req, res, next) {
    
        var in_array = exports.in_array;
        if(req.user && in_array(req.user.roles, role)){
            next();
        }else{
            var err = new Error('Forbidden');
            err.status = 403;
            next(err);
        }
    };
};


exports.getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    }
    else {
        for (var errName in err.errors) {
            if (err.errors[errName].message)
                message = err.errors[errName].message;
        }
    }

    return message;
};

//http://j-query.blogspot.ru/2011/04/express-pagination-middleware.html
exports.pagination = function(model, filter){
    return function(req, res, next) {
        var page = parseInt(req.query.pages) || 1;
        var limit = settings.limit || 6;
        filter = filter || {};
        console.log(model);
        model.count(filter, function(err, total) {
            var pages = Math.ceil(total / limit);
            console.log('------------err---'+err+'-----------');
            console.log('------------total---'+total+'-----------');
            console.log('------------page---'+page+'-----------');
            console.log('------------pages---'+pages+'-----------');
            res.locals.total = total;
            res.locals.pages = _.range(1, pages+1);
            res.locals.page = page;
            if(pages>1){
                if (page > 1) res.locals.prev = true;
                //if (page >= pages) res.locals.prev = true;
                if (page < pages) res.locals.next = true;
            }
            next();
        });
    };
};


exports.subPagination = function(field){
    return function(req, res, next) {
        var page = parseInt(req.query.pages) || 1;
        res.locals.page = page;
        res.locals.field = field;
        next();
    };
};

