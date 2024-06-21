const User =require('../model/userModel');
const bcrypt = require('bcrypt');
const ChatModel = require('../model/chatModel');

const registerLoad = (req, res) => {
    try{
        res.render('register');
    
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    
}   
const register = async (req, res) => {
    try{

        const passwordHash = await bcrypt.hash(req.body.password, 10);
     const user =    new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: passwordHash,
        });

        await user.save();
            
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
const loadLogin = async (req, res) => {
    try{
        res.render('login');
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
const login = async (req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email: email});
        if(userData){
            const isMatch = await bcrypt.compare(password, userData.password);
            if(isMatch){
                req.session.user = userData;
                res.redirect('/dashboard');
            }
            else{
                res.render('login',{message: 'Invalid email or password'});
            }
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
const logout = async (req, res) => {
    try{
        req.session.destroy();
        res.redirect('/login');
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
const loadDashboard = async (req, res) => {
    try{

        var users = await User.find({_id: { $nin: [req.session.user._id]}});
        res.render('dashboard',{user: req.session.user,users:users});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}

const saveChat = async (req, res) => {
    try {
        const newChat = new ChatModel({
            senderId: req.body.senderId,
            receiverId: req.body.receiverId,
            message: req.body.message
        });
        await newChat.save().then(() => {
            console.log('Message saved successfully:', newChat.message); // Log saved message details
        });
          
        res.json({ success: true, message: newChat.message,senderId:newChat.senderId,receiverId:newChat.receiverId});
        console.log('Message saved successfully:', newChat.message); // Log saved message details

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat
}