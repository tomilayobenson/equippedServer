const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const orderLinesSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Currency,
        required: true
    }
})

const ordersSchema = new Schema(
    {
        orderLines: [orderLinesSchema],
        notes: {
            type: String,
            required: false
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
        firstName: {
            type: String,
            required: false
        },
        lastName: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', ordersSchema);

module.exports = Order;