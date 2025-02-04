import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        default : ""
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    msgByUserId : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },groupId: { // ID của nhóm (nếu tin nhắn thuộc nhóm)
        type: mongoose.Schema.ObjectId,
        ref: 'Group',
    },
},{
    timestamps : true
})

const conversationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    messages : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Message'
        }
    ]
},{
    timestamps : true
})
const groupConversationSchema = new mongoose.Schema({
    groupId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Group', // Liên kết với GroupModel
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Message', // Liên kết với MessageModel
      }
    ],
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message', // Tin nhắn cuối cùng trong nhóm
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }, {
    timestamps: true, // Để lưu thời gian tạo và cập nhật
  });
const MessageModel = mongoose.model('Message',messageSchema)
const ConversationModel = mongoose.model('Conversation',conversationSchema)
const GroupConversationModel = mongoose.model(
    'GroupConversation',
    groupConversationSchema
  );
export default{
    MessageModel,
    ConversationModel,
    GroupConversationModel
}