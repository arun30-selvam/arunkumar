const mongoose = require('mongoose');


const RegisterSchema = new mongoose.Schema({
    name:String,
    email:String,
    pass:String,
    phone:String,
    country:String

    
});
module.exports = mongoose.model('register',RegisterSchema,'signs');