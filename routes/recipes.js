const data = require("../data");
const userData = data.users;
const recipeData = data.recipes;
const imageData = data.images;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
let notFound = path.resolve("./static/404.html");
const xss = require("xss");
const fs = require('fs');
const multer = require('multer');
const uuid = require("node-uuid");



// get recipe by id
router.get("/id/:id", async (req, res) => {
    try {
        
        let author = false;
        let followed = false;
        let rated = false;
        let recipeid = req.params.id;
        
        if (req.isAuthenticated()) {
            let userid = req.user._id;
            author = await isAuthor(userid, recipeid);
            followed = await userData.isFollowed(userid, recipeid);
            rated = await recipeData.isRated(userid, recipeid);
        }
        
        //let avgRate = await recipeData.getRate(req.params.id);
        console.log("is followed:" + followed);
        let recipe = await recipeData.getRecipeById(recipeid);
        let user = await userData.getUserById(recipe.user_id);
        let image = await imageData.getImageByRecipeId(recipeid);
        let imagePath;
        if(image){
            imagePath = image.path;
        }
        let avgRate;
        if (recipe.rates) {
            let sum = 0;
            for (i = 0; i < recipe.rates.length; i++) {
                sum += parseInt(recipe.rates[i].rate);
            }
            console.log("average rate:" + sum, recipe.rates.length)
            avgRate = (sum / recipe.rates.length).toFixed(2);
        }
        
        res.render("layouts/recipe", {
            recipe: recipe, user: user, isAuthor: author,imagePath :imagePath,
            isFollowed: followed, isRated: rated, avgRate: avgRate
        });
    } catch (error) {
        res.sendfile(notFound);
    }
});

// get all recipes
router.get("/", async (req, res) => {
    try {
        let recipelist = await recipeData.getAllRecipes()
        res.json(recipeList);
    } catch (error) {
        res.sendStatus(404, { message: error });
    }
});


// search recipe
router.post("/search", async (req, res) => {
    try {
        let search = xss(req.body.search);
        console.log("search for:" + search);
        let obj = {};
        if (req.user) {
            obj.islogin = true;
        }
        let recipelist = await recipeData.getRecipesByTitle(search);
        if (!recipelist) {
            recipelist = await recipeData.getRecipesByIngredient(search);
        }
        obj.recipelist = recipelist;

        //console.log(recipelist);
        res.render("layouts/index", { obj: obj });
    } catch (error) {
        console.log(error);
        res.sendStatus(500, { message: error });
    }
});

// go to add recipe page
router.get("/add", isLogedIn, async (req, res) => {
    res.render("layouts/addrecipe");
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/..', '/public/img/recipes')); // get the right path!
    },
    filename: function (req, file, cb) {
        let idx = file.mimetype.indexOf('/')
        let type = file.mimetype.substring(idx + 1);
        type = type.toLowerCase();

        cb(null, uuid.v1() + '.' + type);
    }
})

function fileFilter(req, file, cb) {
    var type = file.mimetype;
    var typeArray = type.split("/");
    if (typeArray[0] == "video" || typeArray[0] == "image") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

var upload = multer({storage: storage, dest: "public/uploads",fileFilter: fileFilter});
// let upload = multer({dest:'./public/img/recipes'});

// submit add recipe form
router.post("/add", isLogedIn, upload.single('recipeImage'),async (req, res) => {
    try {
        console.log("add recipe:" + req.body.title);
        console.log(req);
        let title = xss(req.body.title);
        //console.log(title);
        let userid = req.user._id;

        let ingredientNames = xss(req.body.ingredients);
        let amounts = xss(req.body.amounts);
        let ingreArr = ingredientNames.split(',');
        let amounArr = amounts.split(',');

        let ingredients = [];
        for (let i = 0; i < ingreArr.length; i++) {
            let ingredient = {};
            ingredient.name = ingreArr[i];
            ingredient.amount = amounArr[i];
            ingredients.push(ingredient);
        }
        let steps = xss(req.body.steps);
        let stepArr = steps.split(',');
        //console.log(ingredients);

        let recipeId = uuid.v4();
        let addrecipe = await recipeData.addRecipe(recipeId,title, userid, ingredients, stepArr);
        if(req.file){
            let imagePath = '/public/img/recipes/'+req.file.filename;
            let addImage = await imageData.addImage(imagePath,recipeId);
        }
        res.redirect(`/user/profile`);
    } catch (error) {
        console.log(error);
        // res.redirect('/user/profile', { message: "faliure add resipe" });
        res.sendStatus(500, { message: error });
    }


});

// go to recipe edit page
router.get("/edit/:id", isLogedIn,  async (req, res) => {
    try {
        if (!isAuthor(req.user._id, req.params.id)) {    // if not author
            res.redirect(`/recipe/id/${req.params.id}`);
        }
        let originalRecipe = await recipeData.getRecipeById(req.params.id);
        console.log(originalRecipe);
        res.render("layouts/recipeedit", { originalRecipe: originalRecipe });
    } catch (error) {
        console.log(error);
        // res.redirect(`/recipe/id/${req.params.id}`, { message: "faliure edit resipe" });
        res.sendStatus(404, { message: error });
    }
});

// submit recipe update
router.post("/edit/:id", isLogedIn, upload.single('recipeImage'), async (req, res) => {
    try{
    if (!isAuthor(req.user._id, req.params.id)) {    // if not author
        res.redirect(`/recipe/id/${req.params.id}`);
    }
    console.log(req);
    let recipeid = req.params.id;
    // let ingredientNames = xss(req.body.ingredients);
    // let amounts = xss(req.body.amounts);
    // let ingredients = [];
    // for (let i = 0; i < ingredientNames.length; i++) {
    //     let ingredient = {};
    //     ingredient.name = ingredientNames[i];
    //     ingredient.amount = amounts[i];
    //     ingredients.push(ingredient);
    // }
    // updaterecipe.steps = xss(req.body.steps);
    let ingredientNames = xss(req.body.ingredients);
    let amounts = xss(req.body.amounts);
    let ingreArr = ingredientNames.split(',');
    let amounArr = amounts.split(',');
    let ingredients = [];
    for (let i = 0; i < ingreArr.length; i++) {
        let ingredient = {};
        ingredient.name = ingreArr[i];
        ingredient.amount = amounArr[i];
        ingredients.push(ingredient);
    }

    let steps = xss(req.body.steps);
    let stepArr = steps.split(',');

    let updaterecipe = {};
    updaterecipe.title = xss(req.body.title);
    updaterecipe.ingredients = ingredients;
    updaterecipe.steps = stepArr;
    //console.log(ingredients);
    let addrecipe = await recipeData.updateRecipe(recipeid, updaterecipe);
    if(req.file){
        let imagePath = '/public/img/recipes/'+req.file.filename;
        let updatedImage ={
            path: imagePath
        };
        let updateImage = await imageData.updateImage(recipeid,updatedImage);
    }

    res.redirect(`/recipe/id/${req.params.id}`);
    }catch(error){
        console.log(error);
    }
});

// delete recipe
router.get("/delete/:id", isLogedIn, async (req, res) => {
    try {
        if (!isAuthor(req.user._id, req.params.id)) {    // if not author
            res.redirect(`/recipe/id/${req.params.id}`);
        }
        let removerecipe = await recipeData.removeRecipe(req.params.id);
        res.redirect("/user/profile");
    } catch (error) {
        // res.json({ message: "faliure to delete" });
        res.sendStatus(500, { message: error });
    }
});

// follow recipe
router.get("/follow/:recipeid", isLogedIn, async (req, res) => {
    try {
        let user = userData.addFollowedRecipe(req.user._id, req.params.recipeid);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    } catch (error) {
        console.log(error);
        // res.redirect(`/recipe/id/${req.params.recipeid}`);
        res.sendStatus(500, { message: error });
    }
});

router.get("/unfollow/:recipeid", isLogedIn, async (req, res) => {
    try {
        let user = await userData.removeFollowedRecipe(req.user._id, req.params.recipeid);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    } catch (error) {
        console.log(error);
        //res.redirect(`/recipe/id/${req.params.recipeid}`);
        res.sendStatus(500, { message: error });
    }

});

// post comment
router.post("/comment/:recipeid", isLogedIn, async (req, res) => {
    try {
        let comment = xss(req.body.comment);
        let recipeid = req.params.recipeid;
        let poster = xss(req.user.nick_name);
        let result = recipeData.addComment(recipeid, poster, comment);
        res.redirect(`/recipe/id/${recipeid}`);
    } catch (error) {
        console.log(error);
        res.sendStatus(500, { message: error });
    }
});

router.post("/rating/:recipeid", isLogedIn, async (req, res) => {
    try {
        let rate = xss(req.body.rate);
        let recipeid = req.params.recipeid;
        let userid = req.user._id;
        //console.log(rate,recipeid);
        let result = recipeData.addRate(recipeid, userid, rate);
        res.redirect(`/recipe/id/${recipeid}`);
    } catch (error) {
        console.log(error);
        res.sendStatus(500, { message: error });
    }
});


function isLogedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("authenticated fail go to login page");
    res.redirect('/user/login');
};

async function isAuthor(userid, recipeid) {
    let recipe = await recipeData.getRecipeById(recipeid);
    if (recipe.user_id === userid) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;

