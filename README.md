HMVC web framework for Node.js. 

**Live Demo**: https://severus.herokuapp.com/
 
**Step**
- create admin user go to http://example.com/init/
- create test data login and go to http://example.com/addtestpost/

**Modules**
- admin
- posts (add subpagination split content  <!-- nextpage -->)
- search
- tags
- category
- api
- account

**TO-DO**
- pages module

HMVC Project Structure
-----------------

```
root
    |
    config
        |
        locales
            |
            --en.json
        --initializers
        --routers.js
        --settings.js
    |
    static (static files)
    |
    app
        |
        --modules
            |
            --post(module name)
               |
               --controller
                  |
                  -- post.js  //  modules.export = {}
               |
               --models
                  |
                  -- post.js // handles client requests
               |
               --views
                  |
                  -- post.html
               --routers.js
        --controller      
        --models
        --views
   |
   app.js 
    
```
---
Project Structure
-----------------

| Name                               | Description                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| **config**/initializers/           | init file connect to database, passport                      |
| **config**/settings.js             | Your settings API keys, tokens, passwords and database URL.  |
| **static**/                        | Static assets (fonts, css, js, img).                         |
| **app/modules**/                   | Your modules             |
| **app/controllers**/test.js        | Controller for /api route and all api examples.              |
| **app/models**/test.js             | Mongoose schema and model for User.                          |
| **app/views**/                     | Templates for *login, password reset, signup, profile*.      |
| app.js                             | Main application file.                                       |

**Note:** There is no preference how you name or structure your views.
You could place all your templates in a top-level `views` directory without
having a nested folder structure, if that makes things easier for you.
Just don't forget to update `extends ../layout`  and corresponding
`res.render()` paths in controllers.

List of Packages
----------------

| Package                         | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| async                           | Utility library that provides asynchronous control flow.              |
| bcrypt-nodejs                   | Library for hashing and salting user passwords.                       |
| express                         | Node.js web framework.                                                |
| body-parser                     | Express 4 middleware.                                                 |
| cookie-parser                   | Express 4 middleware.                                                 |
| express-session                 | Express 4 middleware.                                                 |
| errorhandler                    | Express 4 middleware.                                                 |
| method-override                 | Express 4 middleware.                                                 |
| serve-favicon                   | Express 4 middleware offering favicon serving and caching.            |
| express-flash                   | Provides flash messages for Express.                                  |
| express-validator               | Easy form validation for Express.                                     |
| github-api                      | GitHub API library.                                                   |
| nunjucks                        | Template engine for Express.                                          |
| lusca                           | CSRF middleware.                                                      |
| mongoose                        | MongoDB ODM.                                                          |
| nodemailer                      | Node.js library for sending emails.                                   |
| passport                        | Simple and elegant authentication library for node.js                 |
| passport-github                 | Sign-in with GitHub plugin.                                           |
| passport-local                  | Sign-in with Username and Password plugin.                            |
| stripe                          | Offical Stripe API library.                                           |
| lodash                          | Handy JavaScript utlities library.                                    |
| validator                       | Used in conjunction with express-validator in **controllers/api.js**. |
| multer                          | Multer is a node.js middleware for handling multipart/form-data       |



---

<img src="http://i.imgur.com/7KnCa5a.png" width="200">
- Open [mongolab.com](https://mongolab.com) website
- Click the yellow **Sign up** button
- Fill in your user information then hit **Create account**
- From the dashboard, click on **:zap:Create new** button
- Select **any** cloud provider (I usually go with AWS)
- Under *Plan* click on **Single-node (development)** tab and select **Sandbox** (it's free)
 - *Leave MongoDB version as is - `2.4.x`*
- Enter *Database name** for your web app
- Then click on **:zap:Create new MongoDB deployment** button
- Now, to access your database you need to create a DB user
- Click to the recently created database
- You should see the following message:
 - *A database user is required to connect to this database.* **Click here** *to create a new one.*
- Click the link and fill in **DB Username** and **DB Password** fields
- Finally, in `secrets.js` instead of `db: 'localhost'`, use the following URI with your credentials:
 - `db: 'mongodb://USERNAME:PASSWORD@ds027479.mongolab.com:27479/DATABASE_NAME'`

**Note:** As an alternative to MongoLab, there is also [Compose](https://www.compose.io/).


## Thanks To
1. Django
2. [hackathon-starter](https://github.com/sahat/hackathon-starter)
3. [hmvc](https://github.com/alexand7u/hmvc)
4. [kuitos](https://github.com/kuitos/kuitos.github.io)


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2016 and07
