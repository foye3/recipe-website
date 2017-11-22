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
const static = express.static(__dirname+'/public');

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars');
app.use(flash());

app.use(session({ secret: 'keyboard cat', resave:true, saveUninitialized:true }));
app.use(passport.initialize());
app.use(passport.session());
configRoutes(app);

app.listen(3000, () => {

    console.log("We've now got  aa a server!cnm123");
    console.log("Your routes will be running on http://localhost:3000");
});
