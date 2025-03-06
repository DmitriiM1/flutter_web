const express = require('express');
const router = express.Router();
const {User, validateUser} = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Joi = require('joi');
const _ = require('lodash');

//Create account
router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let
        user = await User.findOne({
            email: req.body.email
        });
    if (user) return res.status(400).send('User already registered.');
    user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const token = user.generateAuthToken();
    await user.save();
    return res.send('success');
});

//Sign in
function validateSignIn(credentials) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(225).required()
    });
    return Joi.validate(credentials, schema);
}   
router.post('/login', async (req, res) => {
    const { error } = validateSignIn(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let
        user = await User.findOne({
            email: req.body.email
        });
    if (!user) return res.status(400).send('Invalid email or password.');
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');
    const token = user.generateAuthToken();
    response ={'token': token, 'email': user.email, 'memos': user.memos};
    return res.send(response);
}
);

//Add memo
function validateMemo(content) {
    const schema = Joi.object({
        content: Joi.string().min(1).max(255).required()
    });
    return Joi.validate(content, schema);
}
router.post('/addMemo', auth, async (req, res) => {
    const { error } = validateMemo(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send('Not authorized.');
    user.memos.push({
        timeStamps: Date(),
        content: req.body.content,
    });
    await user.save();
    return res.send(user.memos);
});

//Delete memo
function validateMemoRequest(content) {
    const schema = Joi.object({
        memoId: Joi.number().integer().required()
    });
    return Joi.validate(content, schema);
}

router.delete('/deleteMemo', auth, async (req, res) => {
    const { error } = validateMemoRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send('Not authorized.');
    const memo = user.memos.id(req.body.memoId);
    if (!memo) return res.status(400).send('Memo not found.');
    memo.remove();
    await user.save();
    return res.send(user.memos);
});

//export
module.exports = router;