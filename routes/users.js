const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;



router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('layouts/private', { user: req.user });
    } else {
        let error = req.flash('error');
        res.render('layouts/login', { message: error });
    }
});

router.get("/register", (req, res) => {
    res.render('layouts/register', { message: req.flash('error') });
});

router.post("/register", async (req, res) => {
    try {
        let user = await userData.getUserByName(req.body.username);
        if (user) {
            res.json({ message: "username has been taken" });
        } else {
            let saltRounds = 16;
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            let newUser = await userData.addUser(req.body.username, req.body.nickname, hash);
            res.json({ statues: "success" });
        }
    } catch (e) {
        res.render('layouts/register',{ message: req.flash('error') });
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/private',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get("/private", isLogedIn, (req, res) => {
    res.render('layouts/private', { user: req.user });
});

function isLogedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401);
}

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let user = await userData.getUserById(id);
    done(null, user);
});

passport.use('local', new LocalStrategy(
    async function (username, password, done) {
        try {
            const currUser = await userData.getUserByName(username);
            await comparePassword(password, currUser.hashedPassword);
            return done(null, currUser);
        } catch (error) {
            return done(null, false, { "message": error });
        }
    })
);

async function comparePassword(password, hashedPassword) {
    try {
        let res = await bcrypt.compare(password, hashedPassword);
        if (res) {
            return res;
        } else {
            throw "invalid pwd";
        }
    } catch (error) {
        throw error;
    }
}


module.exports = router;