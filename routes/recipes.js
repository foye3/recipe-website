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
router.post("/add", async (req,res)=>{
    if(!req.user){
        res.redirect('/user/login');
    }
    try {
        //console.log(req.body);
        let title = req.body.title;
        let ingredientNames = req.body.ingredients;
        let amounts = req.body.amounts;
        let steps = req.body.steps;
        let id =  req.user._id;

        let ingredients = [];
        for(let i=0;i<ingredientNames.length;i++){
            let ingredient = {};
            ingredient.name = ingredientNames[i];
            ingredient.amount = amounts[i];
            ingredients.push(ingredient);
        }
        console.log(ingredients);
        let addrecipe = await recipeData.addRecipe(title,id,ingredients,steps);
        res.redirect(`../user/profile`);
    } catch (error) {
        console.log(error);
        res.redirect('../user/profile',{message: "faliure add resipe"});
    }


});

// // go to recipe edit page
router.get("/edit/:id", async (req, res) => {
    //login state
    try{
        let originalRecipe = await recipeData.getRecipeById(req.params.id);
        res.render("layouts/recipeedit",{originalRecipe:originalRecipe});
    }catch(error){
        console.log(error);
        res.redirect(`/id/${req.params.id}`,{message: "faliure add resipe"});
    }
});

// submit recipe update
router.post("/edit/:id", async (req, res) => {
    let recipeid = req.params.id;
    let ingredientNames = req.body.ingredients;
    let amounts = req.body.amounts;
    let ingredients = [];
    for(let i=0;i<ingredientNames.length;i++){
        let ingredient = {};
        ingredient.name = ingredientNames[i];
        ingredient.amount = amounts[i];
        ingredients.push(ingredient);
    }

    let updaterecipe ={};    
    updaterecipe.title = req.body.title;
    updaterecipe.steps = req.body.steps;
    updaterecipe.ingredients = ingredients;
    console.log(ingredients);
    let addrecipe = await recipeData.updateRecipe(recipeid,updaterecipe);
    res.redirect(`../id/${req.params.id}`);
});

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

