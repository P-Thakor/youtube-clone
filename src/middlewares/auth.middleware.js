import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    //get token from cookies
    //verify token
    //if token is valid, get user from db
    //attach user to req object
    //if token is invalid, send 401 error

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) {
            throw new ApiError(401, "Unauthorized");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = user;
    
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized");
    }
});