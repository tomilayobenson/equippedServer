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

const productRouter = express.Router()

productRouter.route('/')
    .get((req, res, next) => {
        Product.find()
            .populate('category')
            .then(products => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(products);
            })
            .catch(err => next(err))
    })
    .post(upload.array('productPhotos', 10), (req, res, next) => {
        const imagesArray = req.files.map(fileObj => fileObj.path.substring(6))
        Product.create({ ...req.body, productPhotos: imagesArray })
            .then(product => {
                console.log('Product Created ', product);
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(product)
            })
            .catch(err => next(err))
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /products');
    })
    .delete((req, res, next) => {
        Product.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    })

productRouter.route('/:productId')
    .get((req, res, next) => {
        Product.findbyId(req.params.productId)
            .populate('category')
            .then(product => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /products/${req.params.productId}`);
    })
    .put((req, res, next) => {
        Product.findByIdAndUpdate(req.params.productId, { $set: req.body }, { new: true })
        then(product => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(product);
        })
            .catch(err => next(err))
    })
    .delete((req, res, next) => {
        Product.findByIdAndDelete(req.params.productId)
        then(response => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(response)
        })
            .catch(err => next(err))
    })

productRouter.route('/:productId/reviews')
    .get((req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(product.reviews);
            })
            .catch(err => next(err))
    })
    .post((req, res, next) => {
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
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /products/${req.params.productId}/reviews`);
    })
    .delete((req, res, next) => {
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

productRouter.route('/:productId/reviews/:reviewId')
    .get((req, res, next) => {
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
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put((req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product && product.reviews.id(req.params.reviewId)) {
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
    .delete((req, res, next) => {
        Product.findById(req.params.productId)
            .then(product => {
                if (product && product.reviews.id(req.params.reviewId)) {
                    product.reviews.id(req.params.reviewId).remove()
                    product.save()
                        .then(product => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(product)
                        })
                        .catch(err => next(err))
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

    module.export=productRouter