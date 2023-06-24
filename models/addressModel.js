const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address: [
        {
            name: {
                type: String
            },
            mobile: {
                type: String
            },

            homeAddress: {
                type: String
            },
            city: {
                type: String,

            },
            street: {
                type: String,

            },
            postalCode: {
                type: Number,
            },
            isDefault: {
                type: Boolean,
                default: false
            }

        }
    ]
});

module.exports = mongoose.model('Address', addressSchema);