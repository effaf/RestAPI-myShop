const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


mongoose.connect(`mongodb+srv://juliebryan998:${process.env.MONGO_ATLAS_PW}@cluster1.ctweqz5.mongodb.net/?retryWrites=true&w=majority`);

//Route handler
const productsController = require('./api/routes/productController');
const ordersController = require('./api/routes/orderController');
const userController = require('./api/routes/userController');



app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers",
                "Origin,X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method ==="OPTIONS"){
        res.header('Access-Control-Allow-Methods','PUT,POST,GET,PATCH,DELETE')
    }
    next();
});

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use('/products', productsController);
app.use('/orders',ordersController);
app.use('/users', userController);

// This is going to be an error handler when user goes to no specified location.
app.use((req,res,next)=>{
    const error = new Error("Not Found");
    console.log("Inside Not found error");
    error.status = 404;
    next(error);
})

// This is the error which the error will be redirected to, and any thing that recieves 
// an error will come to this function
app.use((error,req,res,next)=>{
        res.status(error.status || 500);
        console.log("Inside umbrella error handler");
        res.json({
            error:{
                message: error.message
            }
        })
})

module.exports = app;