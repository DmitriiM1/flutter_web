const mongoose = require('mongoose');
require('dotenv').config();
module.exports = async function connectToDB() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI,
        )
        console.log('Connected to MongoDB...');
    } catch (ex) {
        console.log('Could not connect to MongoDB...');
    }
}