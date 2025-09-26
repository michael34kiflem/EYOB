import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapteruri : {type : String , required : true} ,
  duration: { type: Number , required: true } ,
  time : { type: String, required: true }
});

const audioBookSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  author : {type : String, required : true} ,
  narrator : {type : String, required : true} ,
  description: { type: String},
  rating : { type: Number, min: 0, max: 5  , default: 4.5},
  reviews : { type: Number, default: 0 },
  gradient: { type: String }, // Array of color strings for gradient
  publishDate: { type: Date },
  language: { type: String },
  sampleAudio: { type: String },
  publisher: { type: String },
  artwork: { type: String },
  genre: { type: String },
  authorID: { type: mongoose.Schema.Types.ObjectId,  ref: 'Author' }, 
  chapters: [ChapterSchema] ,
  audiouri : {
    type : String,
    required : true
  } ,
  duration : {
    type : Number, 
    required : true            // // microsecond time for audiobook
  } ,
  time : { type: String, required: true }
});


const Audio = mongoose.model('audio', audioBookSchema)

export default Audio;