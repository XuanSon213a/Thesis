import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel from '../Models/UserModel.js';



const getUserToken = async (token) => {
  if (!token) {
    return {
      message: "session out",
      logout: true,
    };
  }

  try {
    // Xác minh và giải mã token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await UserModel.findOne({ mysql_id: decode.id, }).select('-password');
    
    if (!user) {
      return {
        message: "User not found",
        error: true,
      };
    }

    return user;
  } catch (error) {
    return {
      message: "Invalid token",
      error: true,
    };
  }
};

export default getUserToken;
