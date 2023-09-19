const jwt = require("jsonwebtoken");


module.exports = (req,res,next)=>{
    //return error if not succeed or go to next if succeded
    try{
        const userToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(userToken, process.env.JWT_KEY);
        req.userToken = decoded;
        next();
    
    }catch(error){
        res.status(401);
        res.json({message:" JWT Failed"})
    }
    
}