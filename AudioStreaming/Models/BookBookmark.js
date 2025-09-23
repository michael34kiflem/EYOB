import mongoose  from "mongoose";



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






const Bookmark = mongoose.model('bookmark' , BookMarkSchema) 
export default Bookmark;