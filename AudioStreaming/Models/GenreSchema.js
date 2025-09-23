import mongoose from "mongoose";



const genreSchema = new mongoose.Schema({
    title : {
        type : String ,
        trim : true ,
      
    } ,
    ImageUri : {
        type : String ,
      
    } ,
    subtitle : {
        type : String ,
       
    } ,
    color : {
        type : String
    }
})


const Genre = mongoose.model('genre' , genreSchema)

export default Genre;