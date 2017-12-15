const mongoCollections = require("../config/mongoCollections");
const recipes = mongoCollections.recipes;
const imagesData = require("./images");
const uuid = require("node-uuid");

//recipe data structure 
/*
{
    "_id" : "6de25280-e4ce-44c8-97b1-168ec300847b",
    "title" : "Fried Egg",
    "ingredients" : [ 
        {
            "name" : "Egg",
            "amount" : "2 eggs"
        }, 
        {
            "name" : "Olive Oil",
            "amount" : "1 tbsp"
        }
    ],
    "steps" : [ 
        "First, heat a non-stick pan on medium-high until hot", 
        "Add the oil to the pan and allow oil to warm; it is ready the oil immediately sizzles upon contact with a drop of water.", 
        "Crack the egg and place the egg and yolk in a small prep bowl; do not crack the yolk!", 
        "Gently pour the egg from the bowl onto the oil", 
        "Wait for egg white to turn bubbly and completely opaque (approx 2 min)", 
        "Using a spatula, flip the egg onto its uncooked side until it is completely cooked (approx 2 min)", 
        "Remove from oil and plate", 
        "Repeat for second egg"
    ],
    "comments" : [ 
        {
            "_id" : "eebfa3f1-57e7-4b4c-a638-c82a3b71d611",
            "poster" : "Fan Zhang",
            "comment" : "great recipe"
        }, 
        {
            "_id" : "178bc0de-f9fd-4953-a54f-8093981c4146",
            "poster" : "Fan Zhang",
            "comment" : "+1"
        }, 
        {
            "_id" : "fdcf8fe2-3007-4aa4-a140-58edde443cfd",
            "poster" : "Fan Zhang",
            "comment" : "Easy and clear"
        }
    ],
    "rates" : [
        "_id" : "",
        "user_id" : "",
        "rate" : ""
    ]

}
*/

module.exports = {
    async getAllRecipes() {
        try {
            const recipesCollection = await recipes();
            return await recipesCollection.find({}).toArray();
        } catch (error) {
            throw error;
        }

    },

    async getRecipeById(id) {
        if (!id)
            throw "Must provide an id";
        const recipesCollection = await recipes();
        const recipe = recipesCollection.findOne({ _id: id });
        if (!recipe)
            throw `recipe not found with id: ${id}`;
        return recipe;
    },

    async getRecipeByUserId(userid) {
        console.log("getRecipeByUserId");
        if (!userid) throw "must provide a user id";
        const recipesCollection = await recipes();
        const recipelist = await recipesCollection.find({ user_id: userid }).toArray();
        if(recipelist){
            for (let i = 0; i < recipelist.length; i++) {
                let image = await imagesData.getImageByRecipeId(recipelist[i]._id);
                if (image) {
                    recipelist[i].imagePath = image.path;
                } else {
                    recipelist[i].imagePath = "/public/img/recipes/default.jpg";
                }
            }
        }
        return recipelist;

    },
    async getRecipesByUser(uname) {
        console.log("uname:" + uname);
        if (!uname) throw "must provide a user name";
        const recipesCollection = await recipes();
        const recipelist = await recipesCollection.find({ nick_name: uname }).toArray();
        return recipelist;
    },

    async getRecipesByTitle(title) {
        console.log("getRecipesByTitle:" + title);
        if (!title) throw "must provide a recipe name";
        const recipesCollection = await recipes();
        const recipelist = await recipesCollection.find({ title: { $regex: title, $options: '/' + title + '/i' } }).toArray();
        //if (!recipe) throw "Recipe not found";
        if (recipelist) {
            for (let i = 0; i < recipelist.length; i++) {
                let image = await imagesData.getImageByRecipeId(recipelist[i]._id);
                if (image) {
                    recipelist[i].imagePath = image.path;
                } else {
                    recipelist[i].imagePath = "/public/img/recipes/default.jpg";
                }
            }
        }
        console.log(recipelist);
        return recipelist;
    },

    async getRecipesByIngredient(ingredient) {
        console.log("Inside getRecipesByIngredient " + ingredient);
        if (!ingredient) throw "must provide ingrdient";
        const recipesCollection = await recipes();
        const recipelist = await recipesCollection.find({ "ingredients.name": { $regex: ingredient, $options: '/' + ingredient + '/i' } }).toArray();
        if (recipelist) {
            for (let i = 0; i < recipelist.length; i++) {
                let image = await imagesData.getImageByRecipeId(recipelist[i]._id);
                if (image) {
                    recipelist[i].imagePath = image.path;
                } else {
                    recipelist[i].imagePath = "/public/img/recipes/default.jpg";
                }
            }
        }
        console.log(recipelist);
        return recipelist;
    },

    async addRecipe(recipeId, title, userid, ingredients, steps) {
        if (typeof title !== "string") throw "No title provided";
        if (!userid) throw "Must provid an user id"
        if (!steps || !Array.isArray(steps))
            throw "You must provide an array of steps for your recipe.";
        if (!ingredients || !ingredients[0].name || !ingredients[0].amount)
            throw "You must supply ingredients with keys 'name' and 'amount'";
        try {
            const recipeCollection = await recipes();
            const newRecipe = {
                _id: recipeId,
                user_id: userid,
                title: title,
                ingredients: ingredients,
                steps: steps,
                comments: []
            };

            const newInsertInformation = await recipeCollection.insertOne(newRecipe);
            const newId = newInsertInformation.insertedId;
            return await this.getRecipeById(newId);

        } catch (error) {
            throw error;
        }
    },

    async  removeRecipe(id) {
        if (!id) throw "Must provide an id";
        const recipeCollection = await recipes();
        const deletionInfo = await recipeCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
            throw `Could not delete recipe with id of ${id}`;
        }
        return deletionInfo;
    },

    async  updateRecipe(id, updatedRecipe) {
        const recipeCollection = await recipes();
        const updatedRecipeData = {};
        if (updatedRecipe.title) {
            updatedRecipeData.title = updatedRecipe.title;
        }
        if (updatedRecipe.ingredients && (updatedRecipe.ingredients[0].name) && updatedRecipe.ingredients[0].amount) {
            updatedRecipeData.ingredients = updatedRecipe.ingredients;
        }
        if (updatedRecipe.steps && Array.isArray(updatedRecipe.steps)) {
            updatedRecipeData.steps = updatedRecipe.steps;
        }
        if (updatedRecipe.comments) {
            updatedRecipeData.comments = updatedRecipe.comments;
        }
        let updatedCommand = {
            $set: updatedRecipeData
        };
        const query = {
            _id: id
        };
        await recipeCollection.updateOne(query, updatedCommand);
        return await this.getRecipeById(id);
    },

    async addComment(recipeId, poster, comment) {
        if (!recipeId) throw "must provide an recipe id"
        if (!poster) throw "You must supply a name.";
        if (!comment) throw "You must supply a comment.";
        let commentId = uuid.v4();
        const recipeCollection = await recipes();
        const result = await recipeCollection.findOneAndUpdate({ _id: recipeId }, {
            $addToSet: {
                comments: {
                    _id: commentId,
                    poster: poster,
                    comment: comment
                }
            }
        }, {
                projection: { comments: { $slice: -1 } }
            });
        //console.log(result);
        console.log("add comment success");
        return true;
        // return {
        //     "_id": result.value.comments[0]._id,
        //     "poster": result.value.comments[0].poster,
        //     "comment": result.value.comments[0].comment
        // };
    },

    async getCommentById(id) {
        if (!id) throw "must provide an id";
        const recipeCollection = await recipes();
        const recipe = await recipeCollection.findOne({
            "comments": {
                $elemMatch: {
                    _id: id
                }
            }
        });
        if (!recipe) throw `could not find comment with id: ${id}`;
        return {
            "_id": recipe.comments[0]._id,
            "recipeId": recipe._id,
            "recipeTitle": recipe.title,
            "poster": recipe.comments[0].poster,
            "comment": recipe.comments[0].comment
        };
    },

    async removeComment(id) {
        if (!id) throw "must provide an id";
        const recipeCollection = await recipes();
        const updateInfo = await recipeCollection.update({}, {
            $pull: {
                "comments":
                    { _id: id }
            }
        });
        if (updateInfo.deletedCount === 0) {
            throw `Could not delete comment with id of ${id}`;
        }
    },

    async updateComment(recipeId, commentId, updateComment) {

        let updatedCommentData = {};
        if (updateComment.poster)
            updatedCommentData["comments.$.poster"] = updateComment.poster;

        if (updateComment.comment)
            updatedCommentData["comments.$.comment"] = updateComment.comment;
        let updateCommand = {
            $set: updatedCommentData
        }
        const recipeCollection = await recipes();
        //await recipeCollection.updateOne({_id:recipeId, comments:{$elemMatch:{_id:commentId}}},updateCommand);

        await recipeCollection.findAndModify({
            "_id": recipeId, "comments": {
                $elemMatch: {
                    "_id": commentId
                }
            }
        },
            [],
            updateCommand,
            { new: true });
        return this.getCommentById(commentId);
    },

    async getCommentsByRecipeId(recipeId) {
        if (!recipeId) throw "must provide a recipe id for search";
        const recipeCollection = await recipes();
        const recipe = await recipeCollection.findOne({ _id: recipeId });
        let result = [];
        for (i = 0; i < recipe.comments.length; i++) {
            result.push({
                "_id": recipe.comments[i]._id,
                "recipeId": recipe._id,
                "recipeTitle": recipe.title,
                "poster": recipe.comments[i].poster,
                "comment": recipe.comments[i].comment
            })
        }
        return result;
    },

    async addRate(recipeid, userid, rate) {
        if (!recipeid) throw "must provide a recipe id";
        if (!rate) throw "must provide a rate";
        let rateid = uuid.v4();
        const recipeCollection = await recipes();
        const result = await recipeCollection.findOneAndUpdate({ _id: recipeid }, {
            $addToSet: {
                rates: {
                    _id: rateid,
                    rate: rate,
                    user_id: userid
                }
            }
        },
            {
                projection: { comments: { $slice: -1 } }
            });
        console.log("add comment success");
        return true;
    },

    async isRated(userid, recipeid) {
        if (!userid) throw "must provide user id";
        if (!recipeid) throw "must provide recipe id";
        const recipeCollection = await recipes();
        const rate = await recipeCollection.findOne({
            _id: recipeid,
            rates: {
                $elemMatch: {
                    user_id: userid
                }
            }
        });
        console.log("rate:");
        console.log(rate);
        if (rate) return true;
        //console.log("followed recipe id: " + user.followed_recipes[0].recipe_id);
        return false;
    },

    //return recipe's average rating 
    // async getRate(recipeid){
    //     if(!recipeid) throw "must provide recipe id";
    //     const recipeCollection = await recipes();
    //     const recipe = await recipeCollection.findOne({ _id: recipeid });
    //     console.log(recipe);
    //     if(!recipe.rates||recipe.rates.length===0)
    //         return null;
    //     let sum = 0;
    //     for (i = 0; i < recipe.rates.length; i++) {
    //         sum += recipe.rates.rate;
    //     }
    //     console.log("sum:"+sum,"length"+recipe.rates.length,"res:"+sum/recipe.rates.length);
    //     return sum/recipe.rates.length;
    // }
};