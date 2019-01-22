var path = require( "path" );

module.exports = {
  basepath: __dirname,
  
  port: process.env.PORT || 90,
  
  env: process.env.NODE_ENV || 'development',
  
  view_engine : 'ejs',
  
  view_cache : false,
  
  db: { 
     'mongo' : process.env.MONGO_URL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/db_online'
  },

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },
  
  mailgun: {
    user: process.env.MAILGUN_USER || 'postmaster@sandbox697fcddc09814c6b83718b9fd5d4e5dc.mailgun.org',
    password: process.env.MAILGUN_PASSWORD || '29eldds1uri6'
  },  
  
  limit: 6,
  
  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',
 
  cookie_secret : "sdfsdf970934klsdfsdf@314we",
  
  cookie_name : "aasd%^&%*xofhjgvldskf",
  
  locales : ['en', 'ru', 'de'],
  
  defaultLocale: 'de',
  
  module_dir : '/app/modules/',
  
  locales_dir : '/config/locales',
  
  static_dir: 'static',

  template_loaders : ['/app/views'],
  
  installed_modules : ['admin', 'webservices'],

  initializers : ['mongoose','passport'],  
  
};
