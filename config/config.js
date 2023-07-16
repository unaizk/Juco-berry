require('dotenv').config()

const sessionSecret = process.env.SESSION_SECRET;
const emailUser = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD

module.exports = {
        sessionSecret,
        emailUser,
        emailPassword
}