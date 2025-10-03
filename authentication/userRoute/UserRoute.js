import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from 'express-async-handler';
import User from '../userModel/userModel.js'
import dotenv from 'dotenv'
import {sendPasswordReset} from '../../middleware/sendPasswordResetEmail.js'
import {sendWelcomeEmail} from '../../middleware/NewCustomerEmail.js'
import { protect } from "../../middleware/protectRoute.js";
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

        sendWelcomeEmail({ email: user.email, name: user.name })

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





const otpStore = new Map();

const passwordResetRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;
      
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json({message : 'User not found in our database.'});
        }
        
        // Generate new OTP for each request
        const OTP = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with user's email and expiration (5 minutes)
        otpStore.set(email, {
            otp: OTP,
            expiresAt: Date.now() + 300000 // 5 minutes
        });
        
        await sendPasswordReset({ email: user.email, name: user.name, OTP: OTP });
        res.status(200).json({ message: `A recovery email has been sent to ${email}` });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({message :'Internal server error. Please try again later.'});
    }
});


const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const otpData = otpStore.get(email);

        console.log(otpData)
        
        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({message :'Invalid OTP'});
        }
        
        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({message :'OTP has expired'});
        }
        
        
        const token = jwt.sign(
            { id: email }, 
            process.env.TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        
        
        otpStore.delete(email);
        
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({message :'Internal server error. Please try again later.'});
    }
});

const passwordReset = asyncHandler(async (req, res) => {
    const { token,newPassword } = req.body;
    
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({ email: decoded.id });
        
        if (!user) {
            return res.status(404).json({message : 'User not found'});
        }
        
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ message: 'Password has been successfully updated' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(401).json({message :'Password reset failed. Token may be invalid or expired.'});
    }
});









userRoute.route('/login').post(loginUser);
userRoute.route('/register').post(registerUser);
userRoute.route('/profilepicture').put(updateProfilePicture);
userRoute.route('/password-reset-request').post(passwordResetRequest);
userRoute.route('/verify-otp').post(verifyOTP);
userRoute.route('/password-reset').post(passwordReset);
userRoute.route('/editUserDetails').put(protect , editUserDetails);
userRoute.route('/editProfile').put(protect , editProfile);



export default userRoute;