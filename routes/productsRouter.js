const express = require('express')
const cors = require('./cors')
const Product = require('../models/product')
const Category = require('../models/category')
const authenticate = require('../authenticate')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|png|jpeg|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false)
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: imageFileFilter })

const productsRouter = express.Router()

productsRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, (req, res, next) => {
        Product.find()
            .populate('category')
            .populate('vendor')
            .then(products => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(products);
            })
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, upload.array('productPhotos', 10), (req, res, next) => {
        const imagesArray = req.files.map(fileObj => (`images/${fileObj.filename}`))
        Product.create({ ...req.body, productPhotos: imagesArray, vendor: req.user._id })
            .then(product => {
                console.log('Product Created ', product);
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(product)
            })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /products');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Product.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    })

productsRouter.route('/:productId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, (req, res, next) => {
        Product.findById(req.params.productId)
            .populate('category')
            .populate('vendor')
            .then(product => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /products/${req.params.productId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, upload.array('productPhotos', 10), (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product.vendor.equals(req.user._id)) {
                    const imagesArray = req.files.map(fileObj => (`images/${fileObj.filename}`))
                    Product.findByIdAndUpdate(req.params.productId, { $set: { ...req.body, productPhotos: imagesArray, vendor: req.user._id } }, { new: true })
                        .then(product => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(product);
                        })
                        .catch(err => next(err))
                } else {
                    const err = new Error('You are not authorized to perform this operation!')
                    err.status = 403
                    return next(err)
                }
            })
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product.vendor.equals(req.user._id)) {
                    Product.findByIdAndDelete(req.params.productId)
                        .then(response => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(response)
                        })
                        .catch(err => next(err))
                } else {
                    const err = new Error('You are not authorized to perform this operation!')
                    err.status = 403
                    return next(err)
                }
            })
            .catch(err => next(err))
    })

productsRouter.route('/:productId/reviews')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, (req, res, next) => {
        Product.findById(req.params.productId)
        .populate('reviews.author')
            .then(product => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(product.reviews);
            })
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                req.body.author = req.user._id
                product.reviews.push(req.body)
                product.save()
                    .then(product => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json');
                        res.json(product.reviews);
                    })
                    .catch(err => next(err))
            })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /products/${req.params.productId}/reviews`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product) {
                    product.reviews.forEach(review => {
                        product.reviews.id(review._id).remove()
                    });
                    product.save()
                        .then(product => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(product)
                        })
                        .catch(err => next(err))
                } else {
                    err = new Error(`Product ${req.params.productId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
    })

productsRouter.route('/:productId/reviews/:reviewId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product && product.reviews.id(req.params.reviewId)) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(product.reviews.id(req.params.reviewId))
                } else if (!product) {
                    err = new Error(`Product ${req.params.productId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Review ${req.params.reviewId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product && product.reviews.id(req.params.reviewId)) {
                    if (req.user._id.equals(product.reviews.id(req.params.reviewId).author)) {
                        if (req.body.rating) {
                            product.reviews.id(req.params.reviewId).rating = req.body.rating
                        }
                        if (req.body.text) {
                            product.reviews.id(req.params.reviewId).text = req.body.text
                        }
                        product.save()
                            .then(product => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(product)
                            })
                            .catch(err => next(err))
                    } else {
                        const err = new Error('You are not authorized to perform this operation!')
                        err.status = 403
                        return next(err)
                    }
                } else if (!product) {
                    err = new Error(`Product ${req.params.productId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Review ${req.params.reviewId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product && product.reviews.id(req.params.reviewId)) {
                    if (req.user._id.equals(product.reviews.id(req.params.reviewId).author)) {
                        product.reviews.id(req.params.reviewId).remove()
                        product.save()
                            .then(product => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(product)
                            })
                            .catch(err => next(err))
                    } else {
                        const err = new Error('You are not authorized to perform this operation!')
                        err.status = 403
                        return next(err)
                    }
                } else if (!product) {
                    err = new Error(`Product ${req.params.productId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Review ${req.params.reviewId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
    })

module.exports = productsRouter