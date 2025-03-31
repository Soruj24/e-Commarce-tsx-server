import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from '../secret';
 
 export default cloudinary.config({
    cloud_name: API_KEY,
    api_key: API_SECRET,
    api_secret: CLOUD_NAME
});
