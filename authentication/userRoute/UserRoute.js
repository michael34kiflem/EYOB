import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from 'express-async-handler';
import User from '../userModel/userModel.js'
import dotenv from 'dotenv'

dotenv.config()
const userRoute = express.Router()

const genToken = (id) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error('TOKEN_SECRET not configured');
    }
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: '7d' // Recommended to add expiration
    });
};



const loginUser = asyncHandler(async(req , res)=>{

    const {email , password} = req.body;
    const user = await User.findOne({email}) 
    if(!user){
        return res.status(401).json({message:'Invalid email or password'}) } 

    const duration = 3000 ; 
    let responseSent = false ;

    const timeOut = setTimeout(()=>{
        if(!responseSent){
            responseSent = true ;
            res.status(504). json('Login time out')
        }
    } , duration)



    if (user && (await user.matchPasswords(password))) {  
        
    
        await user.save();
        if(!responseSent) {
            clearTimeout(timeOut)
            res.json(user);
        } 

    
    } else {
        clearTimeout(timeOut)
        res.status(401).json({ message: "Invalid Email or Password" });
        throw new Error("Invalid credentials");
    }
    


})





// registerUser function
const registerUser = asyncHandler(async (req, res) => {
    const { name, phone ,email, password} = req.body;

    // Validate required fields
    if (!name || !email || !phone|| !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Verify token secret exists before any operations
        if (!process.env.TOKEN_SECRET) {
            throw new Error('Server configuration error - missing token secret');
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name,phone , email, password });
        const newToken = genToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            profile: user.profie,
            email: user.email,
            token: newToken,
            phone:user.phone ,
          
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});








const editProfile = async(req , res)=>{

    const {name , email , phone } = req.body
  

    try { 
        
        const user = await User.findById(req.user.id).select('name email phone avatar _id token firstLogin address phone admin active Date');
        
        user.name = name 
        user.email = email 
        user.phone = phone 
        
    
        const response = await user.save()
    
        res.status(200).json(response)
        
    } catch (error) {
        res.status(500).json({
            message:'server error'
        })
    }
  
}







const editUserDetails = async(req , res)=>{
    
    const {userId ,name , email , phone } = req.body

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        user.email = email;
        user.phone = phone;

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Failed to update user details', error: error.message });
    }
};


const updateProfilePicture = async (req, res) => {
  try {
    const {userId} = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    user.profile = req.body.profilePicture;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated',
      profilePicture: user.profile
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile picture',
      error: error.message 
    });
  }
};

userRoute.route('/login').post(loginUser);
userRoute.route('/register').post(registerUser);
userRoute.route('/profilepicture').put(updateProfilePicture);
userRoute.route('/editUserDetails').put(editUserDetails);
userRoute.route('/editProfile').put(editProfile);



export default userRoute;