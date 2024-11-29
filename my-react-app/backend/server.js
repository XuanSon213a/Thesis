import express from 'express';
import mysql from 'mysql';
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
const { MessageModel, ConversationModel } = models;

import getConversation from './helpers/getConversation.js';
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
  const token = req.cookies.token;

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
    req.role = decoded.role; // Add role to request object
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
    socket.join(user?.mongoId)
    console.log('user?.mongoId',user?.id)
    onlineUser.add(user?.mongoId?.toString())

    socket.on('message-page',async(id)=>{
      console.log('userId',id)
      const userDetails = await UserModel.findById(id).select("-password")
      
      const payload = {
          _id : userDetails?.id,
          mongoId: userDetails?.id,
          fullname : userDetails?.fullname,
          email : userDetails?.email,
          profile_pic : userDetails?.profile_pic,
          online : onlineUser.has(id)
      }
      socket.emit('message-user',payload)})
      
    io.emit('onlineUser',Array.from(onlineUser));

    socket.on('new message',async(data)=>{

      //check conversation is available both user
      let conversation = await ConversationModel.findOne({
        "$or" : [
            { sender : data?.sender, receiver : data?.receiver },
            { sender : data?.receiver, receiver :  data?.sender}
        ]
    })
    console.log('conversation',conversation)
    //if conversation is not available
    if(!conversation){
        const createConversation = await ConversationModel({
            sender : data?.sender,
            receiver : data?.receiver
        })
        conversation = await createConversation.save()
    }
        const message = new MessageModel({
          text : data.text,
          imageUrl : data.imageUrl,
          videoUrl : data.videoUrl,
          msgByUserId :  data?.msgByUserId,
        })
        const saveMessage = await message.save()

        const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
          "$push" : { messages : saveMessage?._id }
      })
        const getConversationMessage = await ConversationModel.findOne({
        "$or" : [
            { sender : data?.sender, receiver : data?.receiver },
            { sender : data?.receiver, receiver :  data?.sender}
        ]
    }).populate('messages').sort({ updatedAt : -1 })

    io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

        //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation',conversationSender)
        io.to(data?.receiver).emit('conversation',conversationReceiver)

      console.log('user',user.mongoId)
      console.log('new message', data)
      console.log('conversation',conversation)
    });
//sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user",currentUserId)

        const conversation = await getConversation(currentUserId)

        socket.emit('conversation',conversation)
        
    })

    socket.on('seen',async(msgByUserId)=>{
        
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : user?.mongoId, receiver : msgByUserId },
                { sender : msgByUserId, receiver :  user?.mongoId}
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages  = await MessageModel.updateMany(
            { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
            { "$set" : { seen : true }}
        )

        //send conversation
        const conversationSender = await getConversation(user?.mongoId?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?.mongoId?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })
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