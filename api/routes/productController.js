const express = require('express');
const router  = express.Router();
const Product = require('../models/productSchema')
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const AuthCheck = require('../authmiddleware/check-auth');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
})  

const fileFilter = (req,file,cb)=>{

    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
      
}
const upload = multer({
                storage:storage,
                limits:{
                    fileSize:1024*1024*10
                },
                fileFilter:fileFilter
            });

router.get('/',(req,res,next)=>{
    Product.find().exec()
           .then(docs =>{
                if(docs.length >= 1){
                res.status(200);
                const response = docs.map(doc=>({
                    id:doc._id,
                    name:doc.name,
                    price:doc.price,
                    image:doc.productImage,
                    requests:{type:"GET", url:`http://localhost:3000/products/${doc._id}`}
                }))
                res.json({length:docs.length,
                            products: response});
                }else{
                    res.status(404);
                    res.json({message:"No products added"});
                }
           })
           .catch(err=>{
                res.status(500);
                res.json({error:err});
           })
});

router.post('/', AuthCheck, upload.single('productImage'), (req,res,next)=>{
    console.log('File Path:', req.file.path);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })

    product.save()
           .then(()=>{
            res.status(200).json({
                message:"Handling the POST verb",
                product:product
            })
           })
           .catch(err=>{
            console.log(err)
            res.status(500);
            res.json({
                error:err
            })
           })

    
})

router.get('/:productid',(req,res,next)=>{
    const id = req.params.productid;
    Product.findById(id)
            .exec()
            .then(doc=>{
                if(doc){
                    res.status(200);
                    res.json(doc);
                }else{
                    res.status(404);
                    res.json({message:"Product not found"})
                }
            })
            .catch(err=>{
                console.log(err);
                res.status(500);
                res.json({error:err});
            })

})

router.patch('/:productid', AuthCheck, (req,res,next)=>{
    const id = req.params.productid;
    const updateOps = {}
    for (const ops of req.body){
        updateOps[ops.propsName] = ops.value
    }
    Product.updateOne({_id: id},{
        $set:updateOps
    }).exec()
      .then(result=>{
        res.status(200).json(result);
      })
      .catch(err=>{
        res.status(500);
        res.json({error:err});
      })
})


router.delete('/:productid', AuthCheck, (req,res,next)=>{
    const id = req.params.productid;
    Product.deleteOne({ _id: id }).exec()
           .then((result)=>{
                res.status(200);
                res.json({message:"Product Deleted",
                        request:{
                            type:"POST",
                            url: 'http://localhost:3000/products',
                            body: { name: 'String', price: 'Number' }
                        }});
           })
           .catch(err=>{
                res.status(500);
                res.json({error:err})
           })
})

module.exports = router;
