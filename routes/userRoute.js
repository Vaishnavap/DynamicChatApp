const express = require('express');
const user_route = express();

const bodyparser = require('body-parser');

const session = require('express-session');
const {SESSION_SECRET} = process.env;
user_route.use(session({secret: SESSION_SECRET}));






user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({ extended: true }));


user_route.set('view engine', 'ejs');
user_route.set('views', './views');


user_route.use(express.static('public'));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload  = multer({ storage: storage });

const usercontroller = require('../controllers/userController');


const auth = require('../middleware/auth');
user_route.get('/register',auth.isLogout,usercontroller.registerLoad);
user_route.post('/register',upload.single('image'),usercontroller.register);

user_route.get('/',usercontroller.loadLogin);
user_route.post('/',usercontroller.login);
user_route.get('/logout',auth.isLogin,usercontroller.logout);

user_route.get('/dashboard',auth.isLogin,usercontroller.loadDashboard);
user_route.post('/save-chat',usercontroller.saveChat);
user_route.get('*',function(req,res){
    res.redirect('/');
});


module.exports = user_route;