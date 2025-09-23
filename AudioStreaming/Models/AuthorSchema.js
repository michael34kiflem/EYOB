import mongoose from "mongoose";



const BookWrote = mongoose.Schema({
  title : {
    type : String
  } ,
  ImageUri : {
    type : String
  } 
})

const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Imageuri: { type: String }, // Link to profile or website
  subtitle: { type: String }, // e.g., "Award-winning novelist"
  age: { type: Number },
  booksSold: { type: Number },
  booksWritten: { type: Number },
  authorBook : [BookWrote] ,
  awardRecognition: [String], // e.g., ["Pulitzer Prize", "Booker Award"]
  description: { type: String }
});




const Author = mongoose.model('Author', AuthorSchema)

export default Author;
