import dotenv from 'dotenv'
dotenv.config()

const API_SECRET = process.env.API_SECRET 
const API_KEY = process.env.API_KEY
const CLOUD_NAME = process.env.CLOUD_NAME 
const jwtAccessKey = process.env.JWT_ACCESS_KEY
const jwtRefreshKey = process.env.JWT_REFRESH_KEY

export {
    API_KEY,
    API_SECRET,
    CLOUD_NAME,
    jwtAccessKey,
    jwtRefreshKey,
}