const express = require('express');
const router = express.Router();
const Order = require('../models/orderSchema');
const mongoose = require('mongoose');
const AuthCheck = require('../authmiddleware/check-auth');


// handling routers to the /orders route
router.get('/', AuthCheck, (req,res,next)=>{
    Order.find()
         .exec()
         .then(docs=>{
            if (docs.length >= 1){
                res.status(200);
                res.json({
                    totalOrders:docs.length,
                    orders: docs
                })

            }else{
                res.status(200);
                res.json({message:"No orders found"})
            }
         })
         .catch(err=>{
            res.status(500);
            res.json({error:err});
         })

    res.status(200).json({
        message:"Orders GET handler"
    })
})

router.post('/', AuthCheck, (req,res,next)=>{
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product:req.body.productid,
        quantity:req.body.quantity
    });

    order.save().then((result)=>{
        res.status(200).json({
            message:"Orders POST handler edited",
            order:result
        })
    }).catch(err=>{
        res.status(500);
        res.json({error:err});
    })
    
})

router.get('/:orderId', AuthCheck, (req,res,next)=>{
    Order.findById(req.params.orderId)
         .exec()
         .then(order=>{
            if(order){
                res.status(200);
                res.json({order:order})
            }else{
                res.status(404);
                res.json({message:"Order not found"});
            }
         })
         .catch(err=>{
            res.status(500);
            res.json({error:err});
         })
})

router.delete('/:orderId', AuthCheck, (req,res,next)=>{
    const id = req.params.orderId
    Order.deleteOne({_id: id})
         .exec()
         .then(result=>{
            res.status(200);
            res.json({message:"Order deleted"});
         })
         .catch(err=>{
            res.status(500);
            res.json({error:err});
         })
})

module.exports = router;