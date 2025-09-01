import User from "../model/User";
import bcrypt from "bcryptjs";

//Signup a new user

import User from "../model/User";
import { generateToken } from "../lib/utils";

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
        const userDate = await User.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userDate.password); 

        if(!isPasswordCorrect){
            return res.json({success : false, message : "Invalid credentials"});
        }

        const token = generateToken(userDate._id);

        res.json({success : true, message : "Login successful", token, userData});
    } catch (error){
        res.json({success : false, message : error.message});
        console.log(error.message);
    }
}

