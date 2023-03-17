const express = require('express')
const cors = require('./cors')
const Order = require('../models/order')
const authenticate = require('../authenticate')

const ordersRouter = express.Router()

ordersRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.corsWithOptions, (req, res, next) => {
        Order.find()
            .populate('orderLines.product')
            .then(orders => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(orders);
            })
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        Order.create(req.body)
            .then(order => {
                console.log('Order Created ', order);
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(order)
            })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /orders');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Order.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    })

ordersRouter.route('/:orderId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.corsWithOptions, (req, res, next) => {
        Order.findById(req.params.orderId)
            .populate('orderLines.product')
            .then(order => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(order);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /orders/${req.params.orderId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Order.findByIdAndUpdate(req.params.orderId, { $set: req.body }, { new: true })
        .then(order => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(order);
        })
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Order.findByIdAndDelete(req.params.orderId)
        .then(response => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(response)
        })
            .catch(err => next(err))
    })

module.exports = ordersRouter