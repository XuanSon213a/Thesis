import express from 'express';
import mysql from 'mysql';
import mongoose from 'mongoose';

import bodyParser from 'body-parser';
import cors from 'cors'; // Không cần gọi lại require cho cors
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'

import util from 'util';
import connectDB from './config/connectDB.js';
import 'dotenv/config';
import UserModel from '../backend/Models/UserModel.js';
import { Server } from 'socket.io';
import http from 'http';
import getUserToken from '../backend/helpers/getUserToken.js';
import models from '../backend/Models/ConversationModel.js';
const { MessageModel, ConversationModel, GroupConversationModel } = models;

import getConversation from './helpers/getConversation.js';
import GroupModel from './Models/GroupModel.js';
 const app = express(); // Chuyển app lên trên

// Cấu hình CORS với tùy chọn chính xác
const corsOptions = {
  origin: 'http://localhost:3000',  // Chỉ cho phép các yêu cầu từ nguồn gốc này
  credentials: true,  // Cho phép gửi cookie và thông tin xác thực
};

app.use(cors(corsOptions)); // Sử dụng cấu hình CORS

const port = 3300;
const saltRounds = 10;

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
app.use(express.json()); 
app.use(cors({
  origin: ["http://localhost:3000"],
  methods:["POST","GET"],
  credentials: true,

}))
app.use(cookieParser());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'signup',
});

connectDB();

const verifyUser = (req, res, next) => {
  const token = req.cookies.token|| req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.warn("No token found in cookies");
    return res.status(401).json({ Error: "You are not authenticated" });
  }

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ Error: "Token is not valid" });
    }

    console.log("Decoded token:", decoded);
    req._id = decoded.id;
    req.mongoId = decoded.mongoId;
    req.fullname = decoded.fullname;
    req.role = decoded.role;
     // Add role to request object
     req.user = decoded;
    next();
  });
};

app.get('/page',verifyUser,(req, res) => {
  return res.json({Status:"Success",role: req.role});
})
 // Load biến môi trường từ .env

 // Load biến môi trường từ .env

 // Lấy chuỗi bí mật từ biến môi trường
const query = util.promisify(db.query).bind(db);
app.post('/register', async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validate user inputs
  if (!fullname || !email || !password) {
    return res.status(400).json({ Error: "All fields are required" });
  }

  try {
    // Hash the password
    const hash = await bcrypt.hash(password, saltRounds);

    // Save the user in MySQL
    const sql = "INSERT INTO login (`fullname`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)";
    const values = [fullname, email, hash, 'user'];

    // Execute the MySQL query
    const results = await query(sql, values);
    const userId = results.insertId; // ID of the newly registered user in MySQL

    // Create a JWT token
    const tokenPayload = { id: userId.toString(), email }; // Use `userId` and `email` from inputs
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Save user in MongoDB (without the password)
    const mongoUser = new UserModel({
      fullname,
      email,
      password: hash, // Store the hashed password
      profile_pic: "", // Default profile picture in MongoDB
      mysql_id: userId, // Store the MySQL ID to relate MongoDB data with MySQL
    });

    // Save user in MongoDB and get mongoId
    const savedMongoUser = await mongoUser.save();

    // Get mongoId from MongoDB user
    const mongoId = savedMongoUser._id.toString(); // Ensure mongoId is a string

    // Return success response
    return res.status(201).json({
      Status: "User registered successfully",
      token: token,
      user: { id: mongoId, fullname, email }, // Use mongoId in the response
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ Error: "Server error during registration." });
  }
});





app.post('/login', async (req, res) => {
  const sql = 'SELECT * FROM login WHERE email = ?';

  db.query(sql, [req.body.email], async (err, data) => {
    if (err) return res.json({ Error: "Login error in server" });

    if (data.length > 0) {
      bcrypt.compare(req.body.password.toString(), data[0].password, async (err, response) => {
        if (err) return res.json({ Error: "Password compare error" });

        if (response) {
          const id = data[0].id; // MySQL ID
          const fullname = data[0].fullname;
          const email = data[0].email;
          const role = data[0].role;
          const profile_pic = data[0].profile_pic;

      
          

          // Lấy MongoDB user thông qua MySQL id (mysql_id trong MongoDB)
          try {
            const mongoUser = await UserModel.findOne({ mysql_id: id }); // Tìm người dùng trong MongoDB theo mysql_id
            if (mongoUser) {
              const mongoId = mongoUser._id; // MongoDB ID
              // Tạo token với thông tin người dùng, sử dụng mongoId để tạo token
              const token = jwt.sign(
                { id: mongoId,mongoId: mongoId.toString(), fullname, email, role, profile_pic },  // Dùng mongoId thay cho mysqlId
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
              );
              // Trả về cả MySQL ID và MongoDB ID cùng với thông tin khác
              res.cookie('token', token);
              return res.json({
                Status: "Success",
                mysqlId: id, // MySQL ID
                mongoId: mongoId, // MongoDB ID
                fullname,
                email,
                role,
                profile_pic,
                token, // Thêm token vào phản hồi JSON
              });
            } else {
              return res.json({ Error: "User not found in MongoDB" });
            }
          } catch (error) {
            console.error("Error fetching user from MongoDB:", error);
            return res.json({ Error: "Server error while fetching user data from MongoDB" });
          }
        } else {
          return res.json({ Error: "Password is incorrect" });
        }
      });
    } else {
      return res.json({ Error: "No email existed" });
    }
  });
});



db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
});
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({Status:"Success"});

})

app.get('/admin', verifyUser, (req, res) => {
  if (req.role !== 'admin') {
    return res.json({ Error: "Access denied, not an admin" });
  }
  return res.json({ Status: "Success", message: "Welcome admin!" });
});

app.get('/user', verifyUser, (req, res) => {
  if (req.role !== 'user') {
    return res.json({ Error: "Access denied, not a regular user" });
  }
  return res.json({ Status: "Success", message: "Welcome user!" });
});



// app.get('/api/data', (req, res) => {
//   const sql = 'SELECT * FROM login'; // Thay đổi với tên bảng của bạn
//   db.query(sql, (err, result) => {
//       if (err) {
//           return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
//       }

//       // Chuyển đổi kết quả truy vấn thành JSON và ghi vào file db.json
//       fs.writeFile('data.json', JSON.stringify(result, null, 2), (err) => {
//           if (err) {
//               return res.status(500).json({ error: 'Lỗi ghi file' });
//           }

//           // Trả về thông báo thành công
//           res.json({ message: 'Dữ liệu đã được ghi vào db.json', data: result });
//       });
//   });
// });

import fileUpload from 'express-fileupload'
const uploadOpts = {
  useTempFiles : true,
  tempFileDir: '/tmp/'
}
import XLSX from 'xlsx';
app.post('/api/upload', fileUpload(uploadOpts), (req, res) => {
  try {
    const { excel } = req.files;
    if (excel.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      fs.unlinkSync(excel.tempFilePath);
      return res.status(400).json({ msg: 'File is invalid' });
    }

    const workbook = XLSX.readFile(excel.tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Initialize successData and failureData arrays
    const successData = [];
    const failureData = [];

    // Process all rows asynchronously
    const promises = data.map((row, index) => {
      const { Number, StudentID, Name, Class } = row;
      const sql = 'INSERT INTO students (Number, StudentID, Name, Class) VALUES (?, ?, ?, ?)';

      return new Promise((resolve, reject) => {
        db.query(sql, [Number, StudentID, Name, Class], (err, result) => {
          if (err) {
            failureData.push(row); // Push to failureData if error
            reject(err);
          } else {
            successData.push(row); // Push to successData if successful
            resolve(result);
          }
        });
      });
    });

    // Wait for all database operations to finish
    Promise.allSettled(promises).then(() => {
      fs.unlinkSync(excel.tempFilePath); // Delete temp file after processing

      const responseData = { successData, failureData };
      fs.writeFile('db.json', JSON.stringify(responseData, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error writing to file' });
        }

        return res.json({ msg: 'DONE', data: responseData });
      });
    }).catch(error => {
      console.error(error);
      return res.status(500).json({ msg: 'Server error during database operations' });
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});


const server = http.createServer(app);

// Khởi tạo socket.io với server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    
    credentials: true,
  },
});

// Socket connection
app.use(cors(corsOptions));

//online user
const onlineUser = new Set()
io.on('connection', async (socket) => {

 
  console.log("Connect User:", socket.id);

  const token = socket.handshake.auth.token;
  //current user details
 
  const user = jwt.verify(token, process.env.JWT_SECRET);
  
  if (!user) {
    console.log("User not found with the given token");
    return; // Nếu không tìm thấy người dùng, dừng lại
  }
    // In ra thông tin người dùng đã kết nối
    console.log("User details:", user);
   
    // create a room 
    socket.join(user?.id)
    console.log('user?.mongoId',user?.id)
    onlineUser.add(user?.mongoId?.toString())

    io.emit('onlineUser',Array.from(onlineUser));

    // Tham gia vào nhóm
    socket.on('join-group', async (groupId) => {
      const group = await GroupModel.findById(groupId);
      if (!group) {
        return socket.emit('error', "Group not found");
      }
      socket.join(groupId); // Tham gia phòng của nhóm
      console.log(`User ${user.mongoId} joined group ${groupId}`);
    });


    socket.on('message-page', async (id, isGroup = false) => {
  try {
    if (isGroup) {
      // Logic xử lý nhóm
      console.log('Fetching messages for group:', id);

      // Lấy chi tiết nhóm
      const groupDetails = await GroupModel.findById(id).populate({
        path: 'members',
        select: '_id fullname email profile_pic', // Lấy các trường cần thiết
      });
      
      if (!groupDetails) {
        return socket.emit('error', "Group not found");
      }

      // Tạo payload cho thông tin nhóm
      const groupPayload = {
        id: groupDetails._id.toString(),
        name: groupDetails.fullname,
        description: groupDetails.description || "",
        members: groupDetails.members.map(member => ({
          _id: member._id.toString(),
          
          fullname: member.fullname || "Unknown",
          email: member.email || "",
          profile_pic: member.profile_pic || "",
        })),
      };
      socket.emit('group-details', groupPayload);

      // Lấy các tin nhắn trước đó của nhóm
      const groupConversation = await GroupConversationModel.findOne({ groupId: id })
        .populate({
          path: 'messages',
          populate: { path: 'msgByUserId', select: 'fullname profile_pic _id' }, // Lấy thông tin người gửi
        })
        .sort({ updatedAt: -1 });

      // Trả về danh sách tin nhắn nhóm
      socket.emit('message', groupConversation?.messages || []);
      console.log("Group conversation found:", groupConversation);
      console.log("Group messages sent to client:", groupConversation?.messages || []);
    } else {
      // Logic xử lý tin nhắn cá nhân
      console.log('Fetching messages for user:', id);

      // Lấy thông tin chi tiết người dùng
      const userDetails = await UserModel.findById(id).select("-password");
      if (!userDetails) {
        return socket.emit('error', "User not found");
      }

      const payload = {
        id: userDetails?.id,
        mongoId: userDetails?.mongoId,
        fullname: userDetails?.fullname,
        email: userDetails?.email,
        profile_pic: userDetails?.profile_pic,
        online: onlineUser.has(id),
      };
      socket.emit('message-user', payload);

      // Lấy các tin nhắn trước đó
      const getConversationMessage = await ConversationModel.findOne({
        "$or": [
          { sender: user?.mongoId, receiver: id },
          { sender: id, receiver: user?.mongoId },
        ]
      }).populate('messages').sort({ updatedAt: -1 });

      socket.emit('message', getConversationMessage?.messages || []);
    }
  } catch (error) {
    console.error("Error in message-page:", error.message);
    socket.emit('error', "Failed to fetch messages");
  }
});

      
    
      

socket.on('new message', async (data) => {
  try {
    if (data.isGroup) {
      // Xử lý tin nhắn nhóm
      console.log("Group message received:", data);

      // Kiểm tra nhóm tồn tại
      const group = await GroupModel.findById(data.groupId);
      if (!group) {
        return socket.emit('error', "Group not found");
      }

      // Tạo tin nhắn
      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data.msgByUserId,
        groupId: data.groupId,
      });

      const savedMessage = await message.save();

      // Populate msgByUserId trước khi gửi tin nhắn
      const populatedMessage = await MessageModel.findById(savedMessage._id).populate({
        path: 'msgByUserId',
        select: 'fullname profile_pic _id',
      });

      // Tìm hoặc tạo GroupConversation
      let groupConversation = await GroupConversationModel.findOne({ groupId: data.groupId });
      if (!groupConversation) {
        groupConversation = new GroupConversationModel({
          groupId: data.groupId,
          messages: [populatedMessage._id],
          lastMessage: populatedMessage._id,
        });
        await groupConversation.save();
      } else {
        groupConversation.messages.push(populatedMessage._id);
        groupConversation.lastMessage = populatedMessage._id;
        groupConversation.updatedAt = Date.now();
        await groupConversation.save();
      }

      // Gửi tin nhắn tới tất cả thành viên trong nhóm
      io.to(data.groupId).emit('message', {
        message: populatedMessage,
        groupId: data.groupId,
      });

      console.log("Emitting group message:", {
        message: populatedMessage,
        groupId: data.groupId,
      });
    } else {
      // Xử lý tin nhắn cá nhân
      console.log("Personal message received:", data);

      // Kiểm tra cuộc trò chuyện có tồn tại
      let conversation = await ConversationModel.findOne({
        "$or": [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      });

      // Nếu cuộc trò chuyện chưa tồn tại
      if (!conversation) {
        const createConversation = new ConversationModel({
          sender: data.sender,
          receiver: data.receiver,
        });
        conversation = await createConversation.save();
      }

      // Tạo tin nhắn
      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data.msgByUserId,
      });

      const savedMessage = await message.save();

      // Cập nhật cuộc trò chuyện
      await ConversationModel.updateOne(
        { _id: conversation._id },
        { "$push": { messages: savedMessage._id } }
      );

      // Lấy lại tin nhắn sau khi cập nhật
      const getConversationMessage = await ConversationModel.findOne({
        "$or": [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      }).populate('messages').sort({ updatedAt: -1 });

      // Gửi tin nhắn tới người gửi và người nhận
      io.to(data.sender).emit('message', getConversationMessage?.messages || []);
      io.to(data.receiver).emit('message', getConversationMessage?.messages || []);
    }
  } catch (error) {
    console.error("Error in new message:", error.message);
    socket.emit('error', "Failed to send message");
  }
});

//sidebar
socket.on('sidebar', async (currentUserId) => {
  try {
    console.log("Fetching sidebar for current user:", currentUserId);

    // Lấy danh sách cuộc trò chuyện cá nhân
    const personalConversations = await getConversation(currentUserId);
    
    // Lấy danh sách các nhóm mà người dùng tham gia
    const groupConversations = await GroupModel.find({ members: currentUserId })
      .select("_id fullname description profile_pic members   updatedAt")
      .sort({ updatedAt: -1 });

    // Kết hợp danh sách cá nhân và nhóm
    const allConversations = [
      ...personalConversations, // Các cuộc trò chuyện cá nhân
      ...groupConversations.map((group) => ({
        id: group._id,
        isGroup: true,
        lastMsg: null, // Tin nhắn cuối cùng của nhóm (nếu cần)
        unseenMsg: 0, // Số tin nhắn chưa đọc
        userDetails: {
          _id: group._id.toString(),
          fullname: group.fullname,
          profile_pic: group.profile_pic || "", // Avatar nhóm
          isGroup: true,
          description: group.description || "", // Mô tả nhóm
          members: group.members || [], // Danh sách thành viên
        },
      })),
    ];
    console.log("All Conversations Sent to Client:",allConversations);
    // Gửi dữ liệu đến client
    socket.emit('conversation', allConversations);
  } catch (error) {
    console.error("Error in sidebar:", error.message);
    socket.emit('error', "Failed to fetch sidebar conversations");
  }
});

    // Tham gia tất cả các nhóm của người dùng khi kết nối
  const userGroups = await GroupModel.find({ members: user.id });
  userGroups.forEach(group => socket.join(group._id.toString()));

  console.log(`User ${user.id} joined groups:`, userGroups.map(group => group._id));

  // Tạo nhóm mới
  socket.on('create-group', async (data) => {
    const { fullname, members } = data; // `members` là danh sách ID thành viên
    if (!fullname || !members || !members.length) {
      return socket.emit('error', 'Group name and members are required.');
    }

    const group = new GroupModel({
      fullname,
      members,
      createdBy: user.id,
    });

    const savedGroup = await group.save();

    // Thêm tất cả thành viên vào phòng nhóm
    members.forEach(member => {
      io.to(member).emit('group-created', savedGroup);
      io.sockets.sockets.get(member)?.join(savedGroup._id.toString());
    });

    console.log('Group created:', savedGroup);
    socket.emit('group-created', savedGroup);
  });

//   socket.on('group-message-page', async (groupId) => {
//   try {
//     const groupMessages = await MessageModel.find({ groupId })
//       .populate('msgByUserId', 'fullname profile_pic') // Lấy thông tin người gửi
//       .sort({ createdAt: 1 });

//     const messagesWithSender = groupMessages.map((msg) => ({
//       ...msg.toObject(),
//       senderName: msg.msgByUserId.fullname, // Thêm tên người gửi
//     }));

//     socket.emit('group-messages', messagesWithSender || []);
//   } catch (error) {
//     console.error('Error fetching group messages:', error);
//     socket.emit('group-messages', []); // Gửi danh sách rỗng nếu lỗi xảy ra
//   }
// });

  
  
  
//   socket.on('new group message', async (data) => {
//     const { groupId, sender, text, imageUrl, videoUrl } = data;
  
//     try {
//       const user = await UserModel.findById(sender); // Lấy thông tin người gửi
  
//       const newMessage = new MessageModel({
//         text,
//         imageUrl,
//         videoUrl,
//         msgByUserId: sender,
//         groupId,
//       });
  
//       const savedMessage = await newMessage.save();
  
//       const messageWithSender = {
//         ...savedMessage.toObject(),
//         senderName: user.fullname, // Thêm tên người gửi
//       };
  
//       const group = await GroupModel.findById(groupId).populate('members');
//       group.members.forEach((member) => {
//         io.to(member.toString()).emit('group message', messageWithSender);
//       });
  
//       console.log('New group message sent:', messageWithSender);
//     } catch (error) {
//       console.error('Error sending group message:', error);
//     }
//   });
  
  
  
  
//   socket.on('seen-group', async (groupId) => {
//     try {
//       // Kiểm tra nếu groupId không hợp lệ
//       if (!mongoose.Types.ObjectId.isValid(groupId)) {
//         return socket.emit('error', "Invalid groupId");
//       }
  
//       // Cập nhật tin nhắn thành đã xem
//       const updatedMessages = await MessageModel.updateMany(
//         { groupId: mongoose.Types.ObjectId(groupId), seen: false },
//         { $set: { seen: true } }
//       );
  
//       console.log(`Marked messages as seen for group ${groupId}`);
//       socket.emit('group-seen', { groupId, success: true });
//     } catch (error) {
//       console.error('Error marking messages as seen:', error.message);
//       socket.emit('error', "Failed to mark messages as seen");
//     }
//   });
  
//   socket.on('sidebar-group', async (userId) => {
//     try {
//       // Tìm tất cả nhóm mà người dùng tham gia
//       const groups = await GroupModel.find({ members: userId })
//         .populate('messages')
//         .populate('members', 'fullname profile_pic');
  
//       // Chuẩn bị dữ liệu trả về
//       const groupData = groups.map((group) => {
//         const lastMessage = group.messages[group.messages.length - 1];
//         return {
//           groupId: group._id,
//           groupName: group.fullname,
//           lastMessage: lastMessage ? lastMessage.text : 'No messages yet',
//           members: group.members,
//         };
//       });
  
//       // Gửi danh sách nhóm về client
//       socket.emit('sidebar-group-data', groupData);
//     } catch (error) {
//       console.error('Error fetching sidebar group data:', error);
//     }
//   });
  

socket.on('join-group', (groupId) => {
  socket.join(groupId);
  console.log(`User ${socket.id} joined group ${groupId}`);
});

  // Rời nhóm
  socket.on('leave-group', async (groupId) => {
    if (!groupId) {
      return socket.emit('error', 'Group ID is required.');
    }

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return socket.emit('error', 'Group not found.');
    }

    // Xóa người dùng khỏi nhóm
    group.members = group.members.filter(member => member.toString() !== user.id.toString());
    await group.save();

    socket.leave(groupId);
    io.to(groupId).emit('member-left', { userId: user.id, groupId });

    console.log(`User ${user.id} left group ${groupId}`);
  });
  socket.on("fetch-group-details", async (groupId, callback) => {
    try {
      const group = await GroupModel.findById(groupId).select("name members profile_pic");
      if (!group) {
        return callback(null);
      }
  
      callback(group);
    } catch (error) {
      console.error("Error fetching group details:", error.message);
      callback(null);
    }
  });
//   socket.on('seen',async(msgByUserId)=>{
    
//     let conversation = await ConversationModel.findOne({
//         "$or" : [
//             { sender : user?.mongoId, receiver : msgByUserId },
//             { sender : msgByUserId, receiver :  user?.mongoId}
//         ]
//     })
//     console.log("sender seen : ",user?.mongoId)
//     console.log("receiver seen : ",msgByUserId)
//     const conversationMessageId = conversation?.messages || []

//     const updateMessages  = await MessageModel.updateMany(
//         { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
//         { "$set" : { seen : true }}
//     )

//     //send conversation
//     const conversationSender = await getConversation(user?.mongoId?.toString())
//     const conversationReceiver = await getConversation(msgByUserId)

//     io.to(user?.mongoId?.toString()).emit('conversation',conversationSender)
//     io.to(msgByUserId).emit('conversation',conversationReceiver)
// })
  
    // Xử lý sự kiện disconnect
    socket.on('disconnect', () => {
      onlineUser.delete(user?.mongoId)
      console.log("Disconnect user", socket.id);
    });

});
app.get('/user-details', verifyUser, async (req, res) => {
  try {
    const mongoId = req.mongoId;
    console.log("User ID from middleware:", mongoId);

    const user = await UserModel.findById(mongoId).select('-password'); // .select('-password') để không trả về password

    if (!user) {
      console.warn("No user found for MongoDB ID:", mongoId);
      return res.status(404).json({ Error: "User not found" });
    }

    console.log("User details fetched successfully:", user);
    return res.json({ Status: "Success", user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ Error: "Server error" });
  }
});

app.post('/update-user', verifyUser, (req, res) => {
  const { fullname, profile_pic } = req.body;

  // Kiểm tra dữ liệu
  if (!fullname) {
    return res.status(400).json({ Error: "Fullname is required" });
  }

  const userId = req._id; // Hoặc req.id từ middleware
  
  const sql = 'UPDATE login SET fullname = ?, profile_pic = ? WHERE id = ?';
  db.query(sql, [fullname, profile_pic || '', userId], (err, result) => {
    if (err) {
      return res.status(500).json({ Error: "Database update error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    return res.json({
      Status: "Success",
      Message: "User details updated successfully",
      user: {
        _id: userId,
        fullname: fullname,
        profile_pic: profile_pic || '',
      },
    });
  });
});

//search user
app.post('/search-user', async (req, res) => {
  const { search } = req.body;

  // Validate the input
  if (!search || typeof search !== 'string') {
    return res.status(400).json({ message: "Search keyword is required" });
  }

  try {
    const users = await UserModel.find({
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error searching users:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});


// Bắt đầu server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});