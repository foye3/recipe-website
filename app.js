//test clone
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const exphbs  = require('express-handlebars');
const flash = require('connect-flash');
const passport = require('passport');

let configRoutes = require("./routes");

let app = express();

let hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route

    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};


const static = express.static(__dirname+'/public');

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(rewriteUnsupportedBrowserMethods);

app.use(cookieParser());
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(flash());

app.use(session({ secret: 'keyboard cat', resave:true, saveUninitialized:true }));
app.use(passport.initialize());
app.use(passport.session());
configRoutes(app);

app.listen(3000, () => {

    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});
