const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalSchema = require('passport-local-mongoose')

const userSchema = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    address: {
        type: String,
        required: false
    },
    address2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    zip: {
        type: String,
        required: false
    },        
    email: {
        type: String,
        required: false
    },
    facebookId: String
})
userSchema.plugin(passportLocalSchema)

module.exports = mongoose.model('User',userSchema)