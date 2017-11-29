const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuid = require("node-uuid");
const bcrypt = require("bcrypt");


/*
users:
{
    "_id": "uuid",
    "user_name": "email",
    "nick_name": "nickname",
    "hashed_pwd": "bcrypt 16",
    "followed_recipe": [
        {
            "recipe_id": ""
        }
    ]
}
*/
module.exports = {
    async findUserById(id) {
        if (!id)
            throw "Must provide an id";
        const usersCollection = await users();
        const user = usersCollection.findOne({ _id: id });
        if (!user)
            throw `user not found with id: ${id}`;
        return user;
    },

    // async findUserByName(username) {

    // },

    async addUser(username,nickname,hashedPwd) {
        if (typeof nickname !== "string") throw "No nickname";
        if (typeof username !== "string") throw "No username";
        if (!hashedPwd) throw "No hashed password";
        try {
            const userCollection = await users();
            const newUser = {
                _id: uuid.v4(),
                user_name: username,
                nick_name: nickname,
                hashed_pwd :hashedPwd,
                followed_recipe: []
            };

            const newInsertInformation = await userCollection.insertOne(newUser);
            const newId = newInsertInformation.insertedId;
            return await this.getRecipeById(newId);

        } catch (error) {
            throw error;
        }
    },

    async updateUser(id, updatedUser) {
        const userCollection = await users();
        const updatedUserData = {};
        if (updatedUser.nickname) {
            updatedUserData.nick_name = updatedUser.nickname;
        }
        if (updatedUser.hashedPwd) {
            updatedUserData.hashed_pwd = updatedUser.hashedPwd;
        }
        //here
        if (updatedUser.followedRecipes && (updatedUser.ingredients[0].name) && updatedUser.ingredients[0].amount) {
            updatedUserData.ingredients = updatedUser.ingredients;
        }
        if (updatedUser.steps && Array.isArray(updatedUser.steps)) {
            updatedUserData.steps = updatedUser.steps;
        }
        if (updatedUser.comments) {
            updatedUserData.comments = updatedUser.comments;
        }
        let updatedCommand = {
            $set: updatedUserData
        };
        const query = {
            _id: id
        };
        await userCollection.updateOne(query, updatedCommand);
        return await this.getRecipeById(id);
    },

    async removeUser(user) {

    }
};


