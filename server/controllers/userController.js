import { generateToken } from "../lib/utils.js";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";



//Signup a new user



export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body; 

    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success : false, message : "All fields are required"});
        }

        const user = await User.findOne({email});

        if(user){
            return res.json({success : false, message : "Account already exists with this email"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password : hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);

        res.json({success : true, message : "Account created successfully", token, userData : newUser});

    }catch(error){
        res.json({success : false, message : error.message});
        console.log(error.message);
    }
};

//Controller for logging in a user
export const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const userData = await User.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userData.password); 

        if(!isPasswordCorrect){
            return res.json({success : false, message : "Invalid credentials"});
        }

        const token = generateToken(userData._id);

        res.json({success : true, message : "Login successful", token, userData});
    } catch (error){
        res.json({success : false, message : error.message});
        console.log(error.message);
    }
}

//Controller to check if user is authenticated

export const checkAuth = async (req, res) => {
    res.json({success : true, user : req.user});
};

//Controller to update user profile details

export const updateProfile = async (req, res) => {
    try{
        const {profilePic, bio, fullName} = req.body;

        const userID = req.user._id;

        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userID, {bio, fullName}, {new : true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userID, {profilePic : upload.secure_url, bio, fullName}, {new : true});
        }
        res.json({success : true, userData : updatedUser});

    }catch (error){
        res.json({success : false, message : error.message});
        console.log(error.message);
    }
};


