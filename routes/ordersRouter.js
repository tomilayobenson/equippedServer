const express = require('express')
const cors = require('./cors')
const Order = require('../models/order')
const authenticate = require('../authenticate')

const productRouter = express.Router()

orderRouter.route('/')
    .get((req, res, next) => {
        Order.find()
            .populate('orderLines.product')
            .then(orders => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(orders);
            })
            .catch(err => next(err))
    })
    .post((req, res, next) => {
        Order.create(req.body)
            .then(order => {
                console.log('Order Created ', order);
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(order)
            })
            .catch(err => next(err))
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /orders');
    })
    .delete((req, res, next) => {
        Order.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    })

productRouter.route('/:orderId')
    .get((req, res, next) => {
        Order.findbyId(req.params.orderId)
            .populate('orderLines.product')
            .then(order => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(order);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /orders/${req.params.orderId}`);
    })
    .put((req, res, next) => {
        Order.findByIdAndUpdate(req.params.orderId, { $set: req.body }, { new: true })
        then(order => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(order);
        })
            .catch(err => next(err))
    })
    .delete((req, res, next) => {
        Order.findByIdAndDelete(req.params.orderId)
        then(response => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(response)
        })
            .catch(err => next(err))
    })

module.export = productRouter