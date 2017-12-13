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
    "followed_recipes": [
        {
            "recipe_id": ""
        }
    ]
}
*/
module.exports = {
    async getUserById(id) {
        if (!id)
            throw "Must provide user id";
        const usersCollection = await users();
        const user = usersCollection.findOne({ _id: id });
        if (!user)
            throw `user not found with id: ${id}`;
        return user;
    },
    
    // find user by username
    // return ture or false if find user or not
    async isUserExist(username){
        if(!username){
            
        }
    },

    async getUserByName(username) {
        if (!username)
            throw "Must provide username";
        const usersCollection = await users();
        const user = usersCollection.findOne({ user_name: username });
        if (!user)
            throw "user not found";
        return user;
    },

    async addUser(username, nickname, hashedPwd) {
        if (typeof nickname !== "string") throw "No nickname";
        if (typeof username !== "string") throw "No username";
        if (!hashedPwd) throw "No hashed password";
        try {
            const userCollection = await users();
            const newUser = {
                _id: uuid.v4(),
                user_name: username,
                nick_name: nickname,
                hashed_pwd: hashedPwd,
                followed_recipes: []
            };
            console.log("newUser._id: "+newUser._id);

            const newInsertInformation = await userCollection.insertOne(newUser);
            const newId = newInsertInformation.insertedId;
            return await this.getUserById(newId);

        } catch (error) {
            throw error;
        }
    },

    // update nickname or password
    async updateUser(id, updatedUser) {
        const userCollection = await users();
        const updatedUserData = {};
        if (updatedUser.nickname) {
            updatedUserData.nick_name = updatedUser.nickname;
        }
        if (updatedUser.hashedPwd) {
            updatedUserData.hashed_pwd = updatedUser.hashedPwd;
        }
        
        let updatedCommand = {
            $set: updatedUserData
        };
        const query = {
            _id: id
        };
        await userCollection.updateOne(query, updatedCommand);
        return await this.getUserById(id);
    },

    // async removeUser(user) {

    // }

    // get all followed recipes' id
    async getFollowedRecipes(userId) {
        let user = await this.getUserById(userId);
        return user.followed_recipes;
    },

    async addFollowedRecipe(userId, recipeId) {
        if (!recipeId) throw "must provide an recipe id"
        const userCollection = await users();
        const result = await userCollection.findOneAndUpdate({ _id: userId }, {
            $addToSet: {
                "followed_recipes": {
                    recipe_id: recipeId,
                }
            }
        }, {
                returnNewDocument: true,
                projection: { "followed_recipes": { $slice: -1 } }
            });
            //console.log(result);
            console.log("followed success");            
        return true;
        // return {
        //     "recipe_id": result.value.followed_recipes[0].recipe_id,
        // };
    },


    async removeFollowedRecipe(userId, recipeId) {
        if (!recipeId) throw "must provide recipe id";
        const userCollection = await users();
        const updateInfo = await userCollection.update({_id: userId}, {
            $pull: {
                "followed_recipes":
                    { recipe_id: recipeId }
            }
        });
        if (updateInfo.deletedCount === 0) {
            throw `Could not delete followed recipe with id of ${id}`;
        }
        console.log("remove followed recipe success");
        return true;
    },

    async isFollowed(userid, recipeid){
        // console.log("uid: "+userid);
        // console.log("rid: "+recipeid);
        
        if (!userid) throw "must provide user id";
        if (!recipeid) throw "must provide recipe id";
        const userCollection = await users();
        const followed_recipes = await userCollection.findOne({_id: userid,
            followed_recipes: {
                $elemMatch: {
                    recipe_id: recipeid
                }
            }
        });
        // console.log(followed_recipes);
        if (followed_recipes) return true;
        //console.log("followed recipe id: " + user.followed_recipes[0].recipe_id);
        return false;
        
    }
};


