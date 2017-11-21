const mongoCollections = require("../config/mongoCollections");
const recipes = mongoCollections.recipes;
const uuid = require("node-uuid");

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

    async addRecipe(title, ingredients, steps) {
        if (typeof title !== "string") throw "No title provided";
        if (!steps || !Array.isArray(steps))
            throw "You must provide an array of steps for your recipe.";

        if (!ingredients || !ingredients[0].name || !ingredients[0].amount)
            throw "You must supply ingredients with keys 'name' and 'amount'";

        try {
            const recipeCollection = await recipes();
            const newRecipe = {
                _id: uuid.v4(),
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
                "comments": {
                    _id: commentId,
                    poster: poster,
                    comment: comment
                }
            }
        }, {
                returnNewDocument: true,
                projection: { "comments": { $slice: -1 } }
            });
        //console.log(result);
        return {
            "_id": result.value.comments[0]._id,
            "poster": result.value.comments[0].poster,
            "comment": result.value.comments[0].comment
        };
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

    async getCommentsByRecipeId(recipeId){
        if(!recipeId) throw "must provide a recipe id for search";
        const recipeCollection = await recipes();
        const recipe = await recipeCollection.findOne({_id: recipeId});
        let result = [];
        for(i = 0;i<recipe.comments.length;i++){
            result.push({
                "_id": recipe.comments[i]._id,
                "recipeId": recipe._id,
                "recipeTitle": recipe.title,
                "poster": recipe.comments[i].poster,
                "comment": recipe.comments[i].comment
            })
        }       
        return result; 
    }
};