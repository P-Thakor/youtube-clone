import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get data from frontend
  // validation = not empty
  // check if user exists
  // check for images - avatar
  // upload image to cloudinary
  // create user - entry in database
  // remove password and refresh token from response
  // check for user creation
  // return response

  const { username, email, fullname, password } = req.body;
  console.log(email, password);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "") // check if any of these are empty
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists with specified username or email."
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResponse =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarUploadResponse) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  const user = await User.create({
    username,
    email,
    fullname,
    password,
    avatar: avatarUploadResponse.url,
    coverImage: coverImageUploadResponse?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

export { registerUser };
