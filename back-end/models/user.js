const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//User model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    memos:[
        {
            timeStamps: {
                type: Date,
                default: Date.now
            },
            content: {
                type: String,
                required: true,
                minlength: 1,
                maxlength: 255
            }
        }
    ]
});

userSchema.methods.generateAuthToken = function() {
    const token
        = jwt.sign({_id: this._id}, process.env.JWT_PRIVATE_KEY);
    return token;
}

const User = mongoose.model('User', userSchema);

//Rest validation
function validateUser(user) {
    const schema = {
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    };
    return Joi.validate(user, schema);
}

//exports
