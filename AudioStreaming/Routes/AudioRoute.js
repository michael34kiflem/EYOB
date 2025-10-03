import express from 'express'
import Audio from '../Models/BookSchema.js'
import Author from '../Models/AuthorSchema.js' // ← ADD THIS IMPORT!
import Genre from '../Models/GenreSchema.js'
import Bookmark from '../Models/BookBookmark.js'
import User from '../../authentication/userModel/userModel.js'
import mongoose from 'mongoose';

const AudioRoute = express.Router() 

const fetchAllAudioBooks = async(req , res) =>{
    try {
        const audio = await Audio.find({})
        res.json({audio : audio})
    } catch (error) {
        res.status(500).json({message : 'error fetching audio books'})
    }
}

const fetchBookAuthor = async(req , res) =>{ 
    try { 
        const {bookId} = req.params
        if(!bookId){
            return res.status(400).json({message:'error finding bookId and author'})
        }
        
        const book = await Audio.findById(bookId).populate('authorID').select('authorID');
        
        if(!book) {
            return res.status(404).json({message : 'cannot find the audio'})
        }
        
        res.json(book)
    } catch (error) {
        res.status(500).json({
            message : 'failed fetching data',
            error: error.message // Keep this for debugging
        })
    } 
}




const fetchAuthors = async(req , res) =>{ 
    try { 

        const author = await Author.find({}).select('name , Imageuri')
        
        if(!author) {
            return res.status(404).json({message : 'cannot find the audio'})
        }
        
        res.json(author)
    } catch (error) {
        res.status(500).json({
            message : 'failed fetching author',
            error: error.message // Keep this for debugging
        })
    } 
}


const fetchSelectedAuthor = async(req , res) => { 
    try { 
        let authorId = req.params.authorId
        if(!authorId){
           return res.status(400).json({message : 'authorId not found'})
        }

        const author = await Author.findById(authorId)
        res.status(200).json(author)

    } catch (error) {
        res.status(500).json('server error')
        console.error('error detail' , error)
    }
    

}




const fetchingAllGenre = async(req ,res)=> {
    try {
        const genre = await Genre.find({}) 
        res.json(genre)
    } catch (error) {
        console.error('error detail' , error)
    }
}


const fetchSingleGenre = async(req ,res) =>{
      const genreId = req.params.genreId
    try {

        const genre = await Genre.findById(genreId)
        res.json(genre)
    } catch (error) {
        console.error('error detail' , error)
    }
}


const fetchAudioBookByGenre = async (req ,res)=>{
    try {
        const {genrefetch} = req.params
        const audiobook = await Audio.find({genre:genrefetch})
        res.json(audiobook)
    } catch (error) {
       console.error('error detail' , error) 
    }
}


const fetchBookWrittenByAuthor = async(req , res)=>{ 
    try {
   const {authorname} = req.params 
    const bookwritten =  await Audio.find({author:authorname}) 
    res.json(bookwritten)
    } catch (error) {
        console.log('error detail' ,error)
    }
   
}





// Backend with pagination
export const searchForAudioBook = async (req, res) => {
  try {
    const { searchQuery } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const decodedQuery = decodeURIComponent(searchQuery);
    
    const audio = await Audio.find({
      $or: [
        { title: { $regex: decodedQuery, $options: "i" } },
        { author: { $regex: decodedQuery, $options: "i" } }
      ]
    })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(audio);
  } catch (error) {
    console.error('error detail', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

const fetchSingleAudioBook = async(req ,res) => {
  const {bookId} = req.params 
  try { 
      if(!bookId){
          res.status(400).json('There is no bookId found')
      }
      const book = await Audio.findById(bookId) 
      res.json(book)
  } catch (error) {
      console.error(error)
  }
}; // <-- Add this closing brace and semicolon


const savedAudioBook = async(req , res) =>{
    try {
        const { userId } = req.body;
        const { bookId } = req.params;

        if (!userId || !bookId) {
            return res.status(400).json({ message: 'User ID and Book ID are required' });
        }

        const user = await User.findById(userId);
        const BookExists = await Audio.findById(bookId);
        if (!BookExists) {
            return res.status(404).json({ message: 'Audiobook not found' });
        }  

        const books = {
            userId: userId,
            bookId: bookId ,
            time : BookExists.time ,
            duration : BookExists.duration ,
            title : BookExists.title ,
            author : BookExists.author ,
            audiouri : BookExists.audiouri ,
            narrator : BookExists.narrator ,
            artwork : BookExists.artwork ,
            genre : BookExists.genre ,
        }
        const bookmark = user.bookmark;
        bookmark.push(books);
        await user.save();
        res.status(201).json(bookmark);
    } catch (error) {
        console.error('Error saving audiobook:', error);
        res.status(500).json({ message: 'Failed to save audiobook', error: error.message });
    }
}



const fetchSavedBook = async(req , res) =>{
    
    const {userId} = req.params
try {
    if(!userId){
        res.status(400).json('Error fetching userId') 
    }

    const user = await User.findById(userId)
    const bookmark = user.bookmark
    res.status(200).json(bookmark)
} catch (error) {
    console.error('errorDetail' , error)
}
}



const fetchWishlistBook = async(req , res) =>{
    
    const {userId} = req.params
try {
    if(!userId){
        res.status(400).json('Error fetching userId') 
    }

    const user = await User.findById(userId)
    const wishlist = user.wishlist
    res.status(200).json(wishlist)
} catch (error) {
    console.error('errorDetail' , error)
}
}



const addToWishList = async(req ,res)=>{
 const {userId } = req.body
 const {bookId} = req.params

    try {
  const user = await User.findById(userId) 
  const audio = await Audio.findById(bookId) 

  if(!user){
    res.status(400).json({message: 'user doesnt exist'})
  }

  const newWishlist = {
            userId: userId,
            bookId: bookId ,
            time : audio.time ,
            duration : audio.duration ,
            title : audio.title ,
            author : audio.author ,
            audiouri : audio.audiouri ,
            narrator : audio.narrator ,
            artwork : audio.artwork ,
            genre : audio.genre ,
        }

const wishlist = user.wishlist
wishlist.push(newWishlist) 
await user.save() 

res.status(200).json(user.wishlist)

} catch (error) {
    console.error('Error adding to wishlist:', error)
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message })
}

}




const deleteBookmark = async (req, res) => {
    try {
        let { userId, bookId } = req.params;
        // Validate userId
        if (!userId || !bookId || userId.length !== 24) {
            return res.status(400).json({ message: 'User ID and Book ID are required and must be valid' });
        }

        // O(1) deletion using $pull
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { bookmark: { bookId: bookId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.bookmark);
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ message: 'Failed to delete bookmark', error: error.message });
    }
};



const deleteWishlist = async (req, res) => {
    try {
        let { userId, bookId } = req.params;
        // Validate userId
        if (!userId || !bookId || userId.length !== 24) {
            return res.status(400).json({ message: 'User ID and Book ID are required and must be valid' });
        }

        // O(1) deletion using $pull
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: { bookId: bookId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.wishlist);
    } catch (error) {
        console.error('Error deleting wishlist item:', error);
        res.status(500).json({ message: 'Failed to delete wishlist item', error: error.message });
    }
};

const fetchHighRatedBook = async (req, res) => {
  try {
    const books = await Audio.find({ rating: { $gte: 4 } }) // Only get books with rating >= 4
      .sort({ rating: -1, reviews: -1 }) // Sort by rating first, then by number of reviews
      .limit(10)
      .select('title author rating reviews artwork duration') // Select only needed fields
      .lean(); // Returns plain JavaScript objects for better performance
    
    if (!books || books.length === 0) {
      return res.status(404).json({ message: 'No high-rated books found' });
    }
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching top rated books:', error);
    res.status(500).json({ error: 'Failed to fetch high-rated books' });
  }
};

const fetchRecentAudios = async (req, res) => {
  try {
    const audios = await Audio.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10) // Get only the 10 most recent
      .select('title author createdAt artwork duration narrator')
      .lean();
    
    if (!audios || audios.length === 0) {
      return res.status(404).json({ message: 'No audios found' });
    }
    
    res.json(audios);
  } catch (error) {
    console.error('Error fetching recent audios:', error);
    res.status(500).json({ error: 'Failed to fetch recent audios' });
  }
};

const fetchFocusBooks = async (req, res) => {
  try {
    const focusBooks = await Audio.find({ isFocus: true })
      .limit(10)
      .select('title author artwork duration description isFocus')
      .lean();
    
    if (!focusBooks || focusBooks.length === 0) {
      return res.status(404).json({ message: 'No focus books available' });
    }
    
    res.json(focusBooks);
  } catch (error) {
    console.error('Error fetching focus books:', error);
    res.status(500).json({ error: 'Failed to fetch focus books' });
  }
};




AudioRoute.route('/all').get(fetchAllAudioBooks)
AudioRoute.route('/top-rated').get(fetchHighRatedBook)
AudioRoute.route('/recently-added').get(fetchRecentAudios)
AudioRoute.route('/focus-books').get(fetchFocusBooks)
AudioRoute.route('/genre/all').get(fetchingAllGenre)
AudioRoute.route('/find-book-on-server/:bookId').get(fetchSingleAudioBook)
AudioRoute.route('/fetching-genre-by-id/:genreId').get(fetchSingleGenre)
AudioRoute.route('/author').get(fetchAuthors)
AudioRoute.route('/book-by-genre/:genrefetch').get(fetchAudioBookByGenre)
AudioRoute.route('/book-with-author/:bookId').get(fetchBookAuthor)
AudioRoute.route('/find-specific-author/:authorId').get(fetchSelectedAuthor)
AudioRoute.route('/find-book-written/:authorname').get(fetchBookWrittenByAuthor)
AudioRoute.route('/search-by-title-and-author/:searchQuery').get(searchForAudioBook)
AudioRoute.route('/save-audio-book/:bookId').post(savedAudioBook)
AudioRoute.route('/fetch-Saved-Audio-Book/:userId').get(fetchSavedBook)
AudioRoute.route('/add-audio-to-wishlist/:bookId').post(addToWishList)
AudioRoute.route('/fetch-wishlist/:userId').get(fetchWishlistBook)
AudioRoute.route('/delete-wishlist/:userId/:bookId').delete(deleteWishlist)
AudioRoute.route('/delete-bookmark/:userId/:bookId').delete(deleteBookmark)

export default AudioRoute