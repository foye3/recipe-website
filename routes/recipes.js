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

// get recipe by id
router.get("/id/:id", async (req, res) => {
    let author = false;
    let followed = false;
    if(req.isAuthenticated()){
        author = await isAuthor(req.user._id,req.params.id);
        followed = await userData.isFollowed(req.user._id,req.params.id);
    }
    console.log("is followed:"+followed);
    let id = req.params.id;
    let recipe = await recipeData.getRecipeById(id);
    let user = await userData.getUserById(recipe.user_id);
    res.render("layouts/recipe", { recipe: recipe,user : user ,isAuthor : author, isFollowed : followed});
});

// get all recipes
router.get("/", async (req, res) => {
    try {
        let recipelist = await recipeData.getAllRecipes()
        res.json(recipeList);
    } catch (error) {
        res.sendStatus(500);
    }
});


// search recipe
router.post("/search", async (req, res) => {
    try {
        console.log("search for:" + req.body.search);
        let obj = {};
        if (req.user) {
            obj.islogin = true;
        }
        let recipelist = await recipeData.getRecipesByTitle(req.body.search);
        if (!recipelist) {
            recipelist = await recipeData.getRecipesByIngredient(req.body.search);
        }
        obj.recipelist = recipelist;
        //console.log(recipelist);
        res.render("layouts/index", { obj : obj });
    } catch (error) {
        console.log(error);
        res.sendFile(notFound);
    }
});

// go to add recipe page
router.get("/add", isLogedIn, async (req, res) => {
    res.render("layouts/addrecipe");
});

// submit add recipe form
router.post("/add", isLogedIn ,async (req, res) => {
    try {
        console.log("add recipe:" + req.body.title);
        let title = req.body.title;
        let ingredientNames = req.body.ingredients;
        let amounts = req.body.amounts;
        let steps = req.body.steps;
        let id = req.user._id;

        let ingredients = [];
        for (let i = 0; i < ingredientNames.length; i++) {
            let ingredient = {};
            ingredient.name = ingredientNames[i];
            ingredient.amount = amounts[i];
            ingredients.push(ingredient);
        }
        //console.log(ingredients);
        let addrecipe = await recipeData.addRecipe(title, id, ingredients, steps);
        res.redirect(`/user/profile`);
    } catch (error) {
        console.log(error);
        res.redirect('/user/profile', { message: "faliure add resipe" });
    }


});

// go to recipe edit page
router.get("/edit/:id",isLogedIn, async (req, res) => {
    try {
        if (!isAuthor(req.user._id,req.params.id)) {    // if not author
            res.redirect(`/recipe/id/${req.params.id}`);
        }
        let originalRecipe = await recipeData.getRecipeById(req.params.id);
        console.log(originalRecipe);
        res.render("layouts/recipeedit", { originalRecipe: originalRecipe });
    } catch (error) {
        console.log(error);
        res.redirect(`/recipe/id/${req.params.id}`, { message: "faliure edit resipe" });
    }
});

// submit recipe update
router.post("/edit/:id",isLogedIn, async (req, res) => {
    if (!isAuthor(req.user._id,req.params.id)) {    // if not author
        res.redirect(`/recipe/id/${req.params.id}`);
    }
    let recipeid = req.params.id;
    let ingredientNames = req.body.ingredients;
    let amounts = req.body.amounts;
    let ingredients = [];
    for (let i = 0; i < ingredientNames.length; i++) {
        let ingredient = {};
        ingredient.name = ingredientNames[i];
        ingredient.amount = amounts[i];
        ingredients.push(ingredient);
    }

    let updaterecipe = {};
    updaterecipe.title = req.body.title;
    updaterecipe.steps = req.body.steps;
    updaterecipe.ingredients = ingredients;
    //console.log(ingredients);
    let addrecipe = await recipeData.updateRecipe(recipeid, updaterecipe);
    res.redirect(`/recipe/id/${req.params.id}`);
});

// delete recipe
router.get("/delete/:id",isLogedIn, async (req, res) => {
    try {
        if (!isAuthor(req.user._id,req.params.id)) {    // if not author
            res.redirect(`/recipe/id/${req.params.id}`);
        }
        let removerecipe = await recipeData.removeRecipe(req.params.id);
        res.redirect("/user/profile");
    } catch (error) {
        res.json({ message: "faliure to delete" });
    }
});

// follow recipe
router.get("/follow/:recipeid", isLogedIn, async (req, res) => {
    try{
        let user = userData.addFollowedRecipe(req.user._id,req.params.recipeid);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    }catch(error){
        console.log(error);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    }
});

router.get("/unfollow/:recipeid", isLogedIn, async (req, res) => {
    try{
        let user = await userData.removeFollowedRecipe(req.user._id,req.params.recipeid);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    }catch(error){
        console.log(error);
        res.redirect(`/recipe/id/${req.params.recipeid}`);
    }

});

// // post comment
// router.post("/comment/:recipeid",async (req,res)=>{

// });


function isLogedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("authenticated fail go to login page");
    res.redirect('/user/login');
};

async function isAuthor(userid,recipeid){
    let recipe = await recipeData.getRecipeById(recipeid);
    if(recipe.user_id===userid){
        return true;
    }else{
        return false;
    }
}

module.exports = router;

