import jwt from "jsonwebtoken";

//Function to generate JWT token

export const generateToken = (userID) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET);
    return token;
}