import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true, // Tên nhóm bắt buộc
    }, 
    profile_pic: {
        type: String,
        default: ""
      },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User', // Thành viên của nhóm
        },
    ],
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Message', // Tin nhắn thuộc về nhóm
        },
    ],
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
});

const GroupModel = mongoose.model('Group', groupSchema);

export default GroupModel;
