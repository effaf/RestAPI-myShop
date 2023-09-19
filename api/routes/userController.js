const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/',(req,res,next)=>{
    User.find()
        .exec()
        .then(users=>{
            if(users.length < 1){
                return res.status(500).json({message:"No user found"})
            }else{
                const currentUsers = users.map(user=>({
                    id:user._id,
                    email:user.email
                }))
                
                res.status(200);
                res.json({
                    userCount:users.length,
                    users:currentUsers
                })
            }
        })
        .catch()
})

router.post('/signup',(req,res,next)=>{

    User.find({email:req.body.email})
        .exec()
        .then(user=>{
            if(user.length>=1){
                return res.status(409).json({message:"Email exists"})
            }else{
                bcrypt.hash(req.body.password,10,(err,hash)=>{
                    if(err){
                        return res.status(500).json({
                            error:err
                        })
            
                    }else{
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                email:req.body.email,
                                password: hash
                            })
                            user.save()
                                .then(result=>{
                                    res.status(201);
                                    res.json({message:"User created"})
                                    })
                                .catch(err=>{
                                    res.status(500);
                                    res.json({error:err});
                                })
                        }
                })
            

            }
        })
        .catch(err =>{
            res.status(500);
            res.json({error:err});
        })

    
    
        
})

router.post('/login',(req,res,next)=>{
    User.findOne({email:req.body.email})
        .exec()
        .then(user=>{
            if(!user){
                res.status(401);
                res.json({message:"Auth Failed"})
            }else{
                bcrypt.compare(req.body.password,user.password,(err,result)=>{
                    if(err){
                        return res.status(401).json({message:err});
                    }
                    if(result){
                        //token here
                        const token = jwt.sign({
                            email:user.email,
                            id:user._id
                        },
                        process.env.JWT_KEY,// apne program ki secret key matlab private key
                        {
                            expiresIn:'1h'
                        })
                        return res.status(200).json({
                            message:"Auth Successful",
                            token:token});
                    }
                    
                    res.status(401);
                    res.json({message:"Auth Failed"})


                });
                
            }
        })
        .catch(err=>{
            res.status(500);
            res.json({
                error:err
            })
        })

})

router.delete('/:userId',(req,res,next)=>{
    const id = req.params.userId;
    User.deleteOne({_id:id})
        .exec()
        .then(result=> {
            if(result){
                res.status(200);
                res.json({
                    message:"User deleted"
                })
            }else{
                res.status(500);
                res.json({message:"Invalid user id"});
            }
        })
        .catch(err => {
            res.status(500);
            res.json({error:err});
        })
})

module.exports = router;