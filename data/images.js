
const mongoCollections = require("../config/mongoCollections");
const images = mongoCollections.images;
const uuid = require('node-uuid');

/*
 The image data structure

 {
    "_id": "",
    "path": "",
    "recipe_id": "",
  }
 */

let exportedMethods = {
    async getImageById(id) {
        if (!id) throw "You must provide an image id.";
        const imagesCollection = await images();
        const image = await imagesCollection.findOne({ _id: id });
        if(!image) throw `image with id: ${id} not found.`;
        return image;
    },

    async getImageByRecipeId(recipeId){
        if(!recipeId) throw "You must provide a recipe id.";
        const imagesCollection = await images();
        const image = await imagesCollection.findOne({ recipe_id: recipeId });
        return image; 
    },

    async addImage(path,recipeId){
        let newImage = {
            _id : uuid.v4(),
            path: path,
            recipe_id : recipeId,
        }
        const imagesCollection = await images();
        const newInsertInformation = await imagesCollection.insertOne(newImage);
        const newId = newInsertInformation.insertedId;
        return await this.getImageById(newId);

    },
    async updateImage(recipeId, updatedImage) {
        if(!recipeId) throw "You must provide a recipe id.";
        const imagesCollection = await images();
        let updatedImageData = {};
        if (updatedImage.path) {
            updatedImageData.path = updatedImage.path;
        }
        let updateCommand = {
            $set: updatedImageData
        };
        const image = await imagesCollection.updateOne({ recipe_id: recipeId },updateCommand);
        return true;
    } 
}

module.exports = exportedMethods;