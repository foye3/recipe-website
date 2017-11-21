const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let user = await findUserById(id);
    done(null, user);
});

passport.use('local', new LocalStrategy(
    async function (username, password, done) {
        try {
            const currUser = await findUser(username);   
            await comparePassword(password, currUser.hashedPassword);
            return done(null, currUser);
        } catch (error) {
            return done(null, false, { "message": error });
        }      
    })
);

async function findUser(username) {
    try {
        let currUser = users.filter(function (obj) {
            return obj.username === username;
        })[0];
        if (currUser === undefined) {
            throw "can not find user";
        } else {
            return currUser;
        }
    } catch (error) {
        throw error;
    }
    
}

async function findUserById(id) {
    try {
        let currUser = users.filter(function (obj) {
            return obj._id === id;
        })[0];
        if (currUser === undefined) {
            throw "can not find user";
        } else {
            return currUser;
        }
    } catch (error) {
        throw error;
    }
    
}

async function comparePassword(password, hashedPassword) {
    try {
        let res = await bcrypt.compare(password, hashedPassword);
        if(res){
            return res;
        }else{
            throw "invalid pwd";
        }
    } catch (error) {
        throw error;
    }
    
    
}

router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('layouts/private', { user: req.user});
    } else {
        let error = req.flash('error');
        res.render('layouts/login', { errors: error });
    }
});

function isLogedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.sendStatus(401);
}

router.post('/login', passport.authenticate('local',{
        successRedirect: '/private',
        failureRedirect: '/',
        failureFlash: true
}));

router.get("/private", isLogedIn, (req, res) => {
    res.render('layouts/private',{user:req.user});
});


const users = [
    {
        _id : "0001",
        username : "masterdetective123",
        firstName : "Sherlock",
        lastName : "Holmes",
        profession: "Detective",
        bio: "Sherlock Holmes (/ˈʃɜːrlɒk ˈhoʊmz/) is a fictional private detective created by British author Sir Arthur Conan Doyle. Known as a \"consulting detective\" in the stories, Holmes is known for a proficiency with observation, forensic science, and logical reasoning that borders on the fantastic, which he employs when investigating cases for a wide variety of clients, including Scotland Yard.",
        hashedPassword: "$2a$16$7JKSiEmoP3GNDSalogqgPu0sUbwder7CAN/5wnvCWe6xCKAKwlTD."
    },
    {
        _id : "0002",
        username : "lemon",
        firstName : "Elizabeth",
        lastName : "Lemon",
        profession: "Writer",
        bio: "Elizabeth Miervaldis \"Liz\" Lemon is the main character of the American television series 30 Rock. She created and writes for the fictional comedy-sketch show The Girlie Show or TGS with Tracy Jordan.",
        hashedPassword: "$2a$16$SsR2TGPD24nfBpyRlBzINeGU61AH0Yo/CbgfOlU1ajpjnPuiQaiDm"
    },
    {
        _id: "0003",
        username : "theboywholived",
        firstName : "Harry",
        lastName : "Potter",
        profession: "Student",
        bio: "Harry Potter is a series of fantasy novels written by British author J. K. Rowling. The novels chronicle the life of a young wizard, Harry Potter, and his friends Hermione Granger and Ron Weasley, all of whom are students at Hogwarts School of Witchcraft and Wizardry . The main story arc concerns Harry's struggle against Lord Voldemort, a dark wizard who intends to become immortal, overthrow the wizard governing body known as the Ministry of Magic, and subjugate all wizards and Muggles.",
        hashedPassword: "$2a$16$4o0WWtrq.ZefEmEbijNCGukCezqWTqz1VWlPm/xnaLM8d3WlS5pnK"
    }
]

module.exports = router;