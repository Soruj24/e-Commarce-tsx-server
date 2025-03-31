import dotenv from 'dotenv'
dotenv.config()

const API_SECRET = process.env.API_SECRET 
const API_KEY = process.env.API_KEY
const CLOUD_NAME = process.env.CLOUD_NAME 

export {
    API_KEY,
    API_SECRET,
    CLOUD_NAME
}