const usersRoutes = require("./users");


const constructorMethod = (app) => {

    app.use("/user", usersRoutes);
    app.use("/",(req,res)=>{
         let obj = {};
        // if(req.isAuthenticated()){
        //     var html = 
        //     "<ul>\
        //         <li><a href='/user/profile'>my profile</a></li>\
        //         <li><a href='/logout'>logout</a></li>\
        //     </ul>";
        //     obj.nickname = req.user.nickname;
        //     obj.header = html;   
        // }
        res.render('layouts/index',obj);
    });
    app.use("*", (req, res) => {
        res.status(404).json({error:"Route Not Found"});
    });

};


module.exports = constructorMethod;