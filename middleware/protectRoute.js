import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../authentication/userModel/userModel.js";



const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET); 
       req.user = await User.findById(decoded.id); 

      if (!req.user) {
        res.status(404);
        throw new Error("User not found");
      }

      next(); 
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
});


const admin = (req, res, next) => {
  if (req.user?.admin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
}
export { admin, protect };

