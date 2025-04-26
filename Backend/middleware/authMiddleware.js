const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    )  {
        try {
            // Extract the token from the header
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //console.log("Decoded Token:", decoded);
            // Find the user by ID and exclude the password field
            req.user = await User.findById(decoded.user.id).select("-password");
            
            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            res.status(401).json({
                message: "Not authorized, token failed"
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        });
    }
};
const admin= async (req,res,next)=>{
        if(req.user&&req.user.role === "administrator")
            next()
        else
        res.status(401).json({
            message: "Not authorized, You're not admin"
        });

}

module.exports = {protect,admin} ;