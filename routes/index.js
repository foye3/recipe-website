const usersRoutes = require("./users");
const recipesRoutes = require("./recipes");

const constructorMethod = (app) => {

    app.use("/user", usersRoutes);
    app.use("/recipe",recipesRoutes);
    app.use("/",(req,res)=>{
        let obj = {};
        obj.islogin = false;
        if(req.user){
            // let html = 
            // `<ul>\
            //     <li>Hi ${req.user.nick_name} </li>\
            //     <li><a href='/user/profile'>my profile</a></li>\
            //     <li><a href='/user/logout'>logout</a></li>\
            // </ul>`;
            obj.nickname = req.user.nick_name;
            obj.islogin = true;   
        }
        //else{
            // let html = 
            // "<ul>\
            //     <li><a href='/user/login'>login</a></li>\
            //     <li><a href='/user/registration'>registration</a></li>\
            // </ul>";
            // obj.header = html;
        //}
        //res.render('layouts/index',obj);
        res.render('layouts/index',{obj: obj});
    });
    app.use("*", (req, res) => {
        res.status(404).json({error:"Route Not Found"});
    });

};


module.exports = constructorMethod;