require('dotenv').config();

module.exports = function() {
    if (!process.env.JWT_PRIVATE_KEY) {
        throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
    }
}