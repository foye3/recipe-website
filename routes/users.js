const data = require("../data");
const userData = data.users;
const recipeData = data.recipes;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
let notFound = path.resolve("./static/404.html");


router.get("/", (req, res) => {
    res.render('layouts/index', { user: req.user });
});

router.get("/registration", (req, res) => {
    res.render('layouts/registration', { error : req.flash('error') });
});

router.post("/registration", async (req, res) => {
    let email = req.body.email;
    let nickname = req.body.nickname;
    let pwd = req.body.password;
    try {
        //console.log("input email: "+ email);
        let user = await userData.getUserByName(email);
        if (user) {
            //res.json({ message: "username has been taken" });
            res.render('layouts/registration',{ email: email, message: "email has been taken." });
        } else {
            let saltRounds = 16;
            const hash = await bcrypt.hash(pwd, saltRounds);
            let newUser = await userData.addUser(email,nickname, hash);
            res.redirect("login");
        }
    } catch (e) {
        //console.log(e);
        res.render('layouts/registration',{message:e});
    }
});

router.get('/login',(req,res)=>{
    //console.log(req.flash('error'));
    let m = req.flash('error');
    //console.log(m);
    res.render('layouts/login',{message:m});
});

passport.use('local', new LocalStrategy(
    async function (username, password, done) {
        try {
            const currUser = await userData.getUserByName(username);
            //if(!currUser) return done(null,false,{message:"Incorrect username."});
            //console.log(currUser);
            const res = await comparePassword(password, currUser.hashed_pwd);
            //if(!res) return done(null,false,{message: "incorrect password."})
            return done(null, currUser);
        } catch (error) {
            return done(null, false, {message: "incorrect username or password" });
        }
    })
);

router.post('/login', passport.authenticate('local', {
    successRedirect: 'profile',
    failureRedirect: 'login',
    failureFlash: true
}));



router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//go to user's profile 
router.get("/profile", isLogedIn, async (req, res) => {
        //console.log(req.user);
        try {
            //console.log(req.user._id);
            const recipeList = await recipeData.getRecipeByUserId(req.user._id);
            //console.log(recipeList);
            const followIdList = await userData.getFollowedRecipes(req.user._id);
            const followedList = [];
            for(let id of followIdList){    //get all followed recipes
                // console.log("recipeId:");
                // console.log(id);
                let recipe = await recipeData.getRecipeById(id.recipe_id);
                followedList.push(recipe);
            }
            //console.log(followedList);
            res.render('layouts/profile',{user: req.user, recipeList: recipeList, followedList: followedList});
            //res.render('layouts/profile',{user: req.user,recipeList: recipeList});            
        } catch (error) {
            console.log(error);
            res.sendFile(notFound);
        }
    // } else {
    //     let error = req.flash('error');
    //     res.render('layouts/login', { message: error });
    // }
});


function isLogedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("authenticated fail go to login page");
    res.redirect('/user/login');
};

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let user = await userData.getUserById(id);
    done(null, user);
});

async function comparePassword(password, hashedPassword) {
    try {
        let res = await bcrypt.compare(password, hashedPassword);
        //console.log("password compared result: "+res);
        if (res) {
            return res;
        } else {
            throw "invalid pwd";
        }
    } catch (error) {
        throw error;
    }
};




module.exports = router;

// Next: 
// edit profile
