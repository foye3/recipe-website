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
    let id = req.params.id;
    let recipe = await recipeData.getRecipeById(id);
    console.log(recipe);
    res.render("layouts/recipe", { recipe: recipe });
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

// // serach recipes by title
// router.get("/:title", (req, res) => {
    
// });

// // search by ingredient
// router.get("/:ingredinet", (req, res) => {

// });

// go to add recipe page
router.get("/add", (req, res) => {
    res.render("layouts/addrecipe");
});

// submit add recipe form
router.post("/add",(req,res)=>{
    if(!req.user){
        res.redirect('/user/login');
    }
    console.log(req.body);
    let title = req.body.title;
    let ingredients = req.body.ingredients;
    let amounts = req.body.amounts;
    let steps = req.body.steps;
    let addrecipe = await recipeData.addRecipe(title,req.user._id,ingredients,steps)
    // need solve addrecipe.js add html to page


});

// // go to recipe update page
// router.get("/update", (req, res) => {
    
// });

// // submit recipe update
// router.post("/update", (req, res) => {
    
// });

// // delete recipe
// router.delete("/:id", (req, res) => {
    
// });

// // follow recipe
// router.get("/follow/:userid/:recipeid", (req, res) => {
    
// });

// // post comment
// router.post("/comment/:recipeid",(req,res)=>{

// });

module.exports = router;

