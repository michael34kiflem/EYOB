import express from 'express' 
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); 
import cors from 'cors' 
import { connectToDatabase } from './DatabaseConnection/connectedToDatabase.js'
import AudioRoute from './AudioStreaming/Routes/AudioRoute.js'

import userRoute from './authentication/userRoute/UserRoute.js'

const app = express() 


app.use(cors())
app.use(express.json())


app.use('/audio' , AudioRoute)
app.use('/user' , userRoute)

connectToDatabase()

app.listen(8000, ()=>{
    console.log('connected on port 8000')
})








