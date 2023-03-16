const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const reviewSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}, {
    timestamps: true
})

const productsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        category: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
        description: {
            type: String,
            required: true
        },
        productPhotos: [{
            type: String,
            required: true
        }],
        address: {
            type: String,
            required: true
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
        forRent: {
            type: Boolean,
            required: false
        },
        day: {
            type: Currency,
            required: false,
            min: 0
        },
        week: {
            type: Currency,
            required: false,
            min: 0
        },
        month: {
            type: Currency,
            required: false,
            min: 0
        },
        value: {
            type: Currency,
            required: false,
            min: 0
        },
        rentQuantity: {
            type: Number,
            required: false
        },
        minRentDays: {
            type: String,
            required: false
        },
        forPurchase: {
            type: Boolean,
            required: false
        },
        price: {
            type: Currency,
            required: false,
            min: 0
        },
        purchaseQuantity: {
            type: Number,
            required: false
        },
        featured: {
            type: Boolean,
            default: false
        },
        reviews: [reviewSchema]
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productsSchema);

module.exports = Product;