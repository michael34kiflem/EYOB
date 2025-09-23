import mongoose from "mongoose";
import bcrypt from 'bcryptjs';


const BookMarkSchema = new mongoose.Schema({

    userId :  String  ,
    bookId : String , 
    time : String ,
    duration : String ,
    title : String ,
    author : String ,
    audiouri : String ,
    narrator : String ,
    artwork : String ,
    genre : String 

})


const userSchema = new mongoose.Schema({
 
    name : {
        type : String ,
        required : true ,
        trim : true 
    } ,
    email : {
        type: String ,
        required : true ,
        trim : true ,
        lowercase : true ,
        match :  [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        unique : true
    } ,
    profile : {
        type : String ,
        default : ""     
    } ,
    password : {
        type : String ,
        required : true ,
        trim: true
    } ,
    subscription: {
        type : String ,
        enum : ['free' , 'premium'] ,
        default : 'free'
    } ,
    phone : {
        type : String ,      
    } , 
    active : {
    type : String ,
    enum : ['active' , 'inactive'] ,
    default : 'active'

    } , 
    bookmark : {
        type : [BookMarkSchema] ,
        default: [] 
    } , 
     wishlist : {
        type : [BookMarkSchema] ,
        default : [] 
     } } ,
     {timestamps: true
})

// Password comparison method    







userSchema.methods.matchPasswords = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error("Error during password comparison:", error);
        return false;
    }
};

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    } else {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;































   
    

