import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
       
    const token = req.cookies.jwt;
    console.log(token); 
    
    if (!token) return res.status(401).send({ success: false, message: "User Unauthorized" });

    const decode = jwt.verify(token, process.env.JWT_SECRET); 
    if (!decode) return res.status(401).send({ success: false, message: "User Unauthorized - Invalid Token" });

    const user = await User.findById(decode.userId).select("-password");
    if (!user) return res.status(401).send({ success: false, message: "User Unauthorized - Invalid User" });

    req.user = user; 
    next();
} catch (error) {
    res.status(500).send({ success: false, message: "Error in login" });
    console.error(error);
}
};
