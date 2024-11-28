import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
    fullname: {
      type: String,
      required: [true, "provide name"]
    },
    email: {
      type: String,
      required: [true, "provide email"],
      unique: true
    },
    password: {
      type: String,
      required: false
    },
    profile_pic: {
      type: String,
      default: ""
    },
    mysql_id: { 
      type: Number,
      unique: true
    }
  }, {
    timestamps: true
  });
  

  
const UserModel = mongoose.model('User',userSchema)

export default UserModel