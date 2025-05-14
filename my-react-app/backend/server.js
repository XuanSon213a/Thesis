import express from 'express';
import mysql from 'mysql';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import multer from 'multer';
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
import AlumniProfile from './Models/ALumniProfile.js';
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
// Tăng giới hạn kích thước dữ liệu lên 50MB
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


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
cloudinary.config({
  cloud_name: 'Untitled', // Thay bằng cloud name của bạn
  api_key: '725124249234581', // Thay bằng API key của bạn
  api_secret: 'XN3QU', // Thay bằng API secret của bạn
});
// Cấu hình multer để xử lý file upload
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint để upload ảnh lên Cloudinary
app.post('/upload-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                console.error('Error uploading to Cloudinary:', error);
                return res.status(500).send('Error uploading image');
            }
            res.json({ location: result.secure_url }); // Trả về URL của ảnh trên Cloudinary
        }).end(req.file.buffer);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
    }
});
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
const verifyAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ Error: "Access denied. Admins only." });
  }
  next();
};
app.get('/page',verifyUser,(req, res) => {
  return res.json({Status:"Success",role: req.role});
})
 // Load biến môi trường từ .env

 // Read the db.json file
fs.readFile('./db.json', 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading db.json:', err.message);
    return;
  }

  const alumniData = JSON.parse(data).failureData;

  for (const alumni of alumniData) {
    const email = `${alumni["Student ID"].toLowerCase()}@student.hcmiu.edu.vn`;
    const password = await bcrypt.hash(alumni["Student ID"], saltRounds);

    // Check if the email already exists in MySQL
    const checkSql = 'SELECT id FROM login WHERE email = ?';
    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        console.error('Error checking email in MySQL:', err.message);
        return;
      }

      if (results.length > 0) {
        console.log(`Email ${email} already exists in MySQL. Skipping.`);
        return;
      }

      // Save to MySQL
      const sql = 'INSERT INTO login (fullname, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(sql, [alumni.Name, email, password, 'user'], async (err, result) => {
        if (err) {
          console.error('Error inserting into MySQL:', err.message);
          return;
        }

      const mysqlId = result.insertId;

      // Save to MongoDB
      const mongoUser = new UserModel({
        fullname: alumni.Name,
        email: email,
        password: password,
        profile_pic: '',
        mysql_id: mysqlId,
      });

      try {
        await mongoUser.save();
        console.log(`Account created for ${alumni.Name}`);
      } catch (error) {
        console.error('Error saving to MongoDB:', error.message);
      }
    });
  });
  }
});




// Function to read db.json and store data in MongoDB and MySQL
const storeDataToDatabases = async () => {
  fs.readFile('./db.json', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err.message);
      return;
    }

    const alumniData = JSON.parse(data).failureData;

    for (const alumni of alumniData) {
      const { "No.": id, "Student ID": studentId, Name: fullname, Class: className } = alumni;
      const Name = fullname;
      const Email = `${studentId.toLowerCase()}@student.hcmiu.edu.vn`;
      const profilePic = '';
      const degree = '';
      const gpa = null;
      const currentJob = '';
      const employer = '';
      const position = '';
      const location = '';
      const experience = '';
      const skills = '';
      const interests = '';
      const contact = '';

      // Save to MySQL
      const sql = 'INSERT INTO alumni (id, student_id, fullname, class, email, profile_pic, degree, gpa, current_job, employer, position, location, experience, skills, interests, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(sql, [id, studentId, fullname, className, Email, profilePic, degree, gpa, currentJob, employer, position, location, experience, skills, interests, contact], async (err, result) => {
        if (err) {
          console.error('Error inserting into MySQL:', err.message);
          return;
        }

        const mysqlId = result.insertId;

        // Save to MongoDB
        const mongoUser = new AlumniProfile({
          id,
          studentId,
          Name, // Ensure fullname is used here
          className,
          Email,
          profilePic,
          degree,
          gpa,
          currentJob,
          employer,
          position,
          location,
          experience,
          skills,
          interests,
          contact,
          mysql_id: mysqlId, // Store the MySQL ID to relate MongoDB data with MySQL
        });

        try {
          await mongoUser.save();
          console.log(`Account created for ${fullname}`);
        } catch (error) {
          console.error('Error saving to MongoDB:', error.message);
        }
      });
    }
  });
};

// Call the function to store data
storeDataToDatabases();

 // Lấy chuỗi bí mật từ biến môi trường
const query = util.promisify(db.query).bind(db);
app.post('/register', async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ Error: "All fields are required" });
  }

  try {
    // Hash password
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Password hashed successfully");

    // Save to MySQL
    const sql = "INSERT INTO login (`fullname`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)";
    const values = [fullname, email, hash, 'user'];
    console.log("Executing MySQL query:", sql, values);

    const results = await query(sql, values);
    console.log("MySQL insert results:", results);

    if (!results || !results.insertId) {
      throw new Error("MySQL insert failed - no insertId returned");
    }

    const userId = results.insertId;
    console.log("New MySQL user ID:", userId);

    // Create JWT
    const token = jwt.sign({ id: userId.toString(), email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Save to MongoDB
    const mongoUser = new UserModel({
      fullname,
      email,
      password: hash,
      profile_pic: "",
      mysql_id: userId,
    });

    const savedMongoUser = await mongoUser.save();
    console.log("MongoDB user saved:", savedMongoUser._id);

    return res.status(201).json({
      Status: "Success",
      token,
      user: { id: savedMongoUser._id, fullname, email },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ Error: error.message || "Server error during registration." });
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
                { expiresIn: '7d' }
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
app.post('/api/upload', fileUpload(uploadOpts), async (req, res) => {
  try {
    const { excel } = req.files;
    if (excel.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        fs.unlinkSync(excel.tempFilePath);
      } catch (err) {
        console.error('Error deleting invalid file:', err);
      }
      return res.status(400).json({ msg: 'File is invalid' });
    }

    const workbook = XLSX.readFile(excel.tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const successData = [];
    const failureData = [];

    const promises = data.map(async (row) => {
      const {
        'No.': id,
        'Student ID': studentId,
        'Name': name,
        'Class': className,
      } = row;

      const email = row['Email'] || '';
      const profilePic = row['Profile Pic'] || '';
      const degree = row['Degree'] || '';
      const gpa = row['GPA'] || '';
      const currentJob = row['Current Job'] || '';
      const employer = row['Employer'] || '';
      const position = row['Position'] || '';
      const location = row['Location'] || '';
      const experience = row['Experience'] || '';
      const skills = row['Skills'] || '';
      const interests = row['Interests'] || '';
      const contact = row['Contact'] || '';

      const sql = 'INSERT INTO alumni (id, student_id, fullname, class, email, profile_pic, degree, gpa, current_job, employer, position, location, experience, skills, interests, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

      try {
        await new Promise((resolve, reject) => {
          db.query(sql, [no, studentId, name, className, email, profilePic, degree, gpa, currentJob, employer, position, location, experience, skills, interests, contact], (err, result) => {
            if (err) {
              console.error('Error inserting into MySQL:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        const mongoUser = new AlumniProfile({
          id,
          studentId,
          name,
          className,
          email,
          profilePic,
          degree,
          gpa,
          currentJob,
          employer,
          position,
          location,
          experience,
          skills,
          interests,
          contact,
        });

        await mongoUser.save();

        successData.push(row);
      } catch (error) {
        failureData.push(row);
        console.error('Error processing row:', error);
      }
    });

    await Promise.allSettled(promises);

    try {
      fs.unlinkSync(excel.tempFilePath);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }

    const responseData = { successData, failureData };
    try {
      fs.writeFile('db.json', JSON.stringify(responseData, null, 2), (err) => {
        if (err) {
          console.error('Error writing to db.json:', err);
          return res.status(500).json({ error: 'Error writing to file' });
        }

        return res.json({ msg: 'DONE', data: responseData });
      });
    } catch (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ error: 'Error writing to file' });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});


// API endpoint to fetch total alumni count
app.get('/api/alumni/count', async (req, res) => {
  try {
    const count = await UserModel.countDocuments();
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching alumni count:", error.message);
    return res.status(500).json({ Error: "Server error" });
  }
});

// API endpoint to fetch total online users count
app.get('/api/online-users/count', async (req, res) => {
  try {
    const count = onlineUser.size;
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching online users count:", error.message);
    return res.status(500).json({ Error: "Server error" });
  }
});
// API endpoint to fetch alumni data grouped by school year
app.get('/api/alumni/group-by-year', async (req, res) => {
  try {
    const alumniData = await UserModel.aggregate([
      {
        $project: {
          year: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: "$email", regex: /ititiu12/ } }, then: "12" },
                { case: { $regexMatch: { input: "$email", regex: /ititiu11/ } }, then: "11" },
                { case: { $regexMatch: { input: "$email", regex: /ititiu10/ } }, then: "10" },
                { case: { $regexMatch: { input: "$email", regex: /ititiu09/ } }, then: "09" },
                
              ],
              default: "Unknown"
            }
          }
        }
      },
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by year
      }
    ]);

    return res.status(200).json({ data: alumniData });
  } catch (error) {
    console.error("Error fetching alumni data grouped by year:", error.message);
    return res.status(500).json({ Error: "Server error" });
  }
});
// Get participation counts for all events
// Get participation counts for all events
app.get('/api/events/participation', (req, res) => {
  const sql = `
    SELECT 
      e.id AS eventId,
      e.title AS eventTitle,
      SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END) AS participants,
      SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END) AS nonParticipants
    FROM events e
    LEFT JOIN votes v ON e.id = v.event_id
    GROUP BY e.id, e.title
    ORDER BY e.id;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching participation data:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
// Get participation counts for all events
app.get('/api/news/participation', (req, res) => {
  const sql = `
    SELECT 
      n.id AS newsId,
      n.title AS newsTitle,
      SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END) AS participants,
      SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END) AS nonParticipants
    FROM news n
    LEFT JOIN newsvotes v ON n.id = v.news_id
    GROUP BY n.id, n.title
    ORDER BY n.id;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching participation data:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});

app.get('/api/org/participation', (req, res) => {
  const sql = `
    SELECT 
      o.id AS orgId,
      o.title AS orgTitle,
      SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END) AS participants,
      SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END) AS nonParticipants
    FROM organisation o
    LEFT JOIN orgvotes v ON o.id = v.org_id
    GROUP BY o.id, o.title
    ORDER BY o.id;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching participation data:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
// filepath: /c:/Users/Admin/Desktop/TTS-TVT/my-react-app/backend/server.js
app.get('/api/alumni/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch data from MySQL
    const sql = 'SELECT * FROM alumni WHERE id = ?';
    db.query(sql, [id], async (err, result) => {
      if (err) {
        console.error('Error fetching from MySQL:', err.message);
        return res.status(500).json({ error: 'Server error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Alumni not found' });
      }
      console.error('id:', id);
      const alumni = result[0];

      // Fetch data from MongoDB
      const mongoAlumni = await AlumniProfile.findOne({ id });

      if (!mongoAlumni) {
        return res.status(404).json({ error: 'Alumni not found in MongoDB' });
      }

      // Combine data from MySQL and MongoDB
      const combinedAlumni = {
        ...alumni,
        ...mongoAlumni._doc,
      };

      res.status(200).json(combinedAlumni);
    });
  } catch (error) {
    console.error('Error fetching alumni data:', error.message);
    res.status(500).json({ error: 'Server error' });
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
const unseenNotifications = {};

//online user
const onlineUser = new Set()
io.on('connection', async (socket) => {

 
  console.log("Connect User:", socket.id);

  const token = socket.handshake.auth?.token; // Safely access the token

  if (!token) {
    console.error("No token provided by the client.");
    socket.emit('error', "Authentication token is required.");
    return; // Stop further execution
  }
   
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET)
  if (user) {
    // Initialize unseen notifications for the user
    if (!unseenNotifications[user.id]) {
      unseenNotifications[user.id] = 0;
    }

    // Send unseen notifications count to the user
    socket.emit('unseenNotifications', unseenNotifications[user.id]);

    // Listen for new events
    socket.on('newEvent', (event) => {
      // Increment unseen notifications for all users except the sender
      for (const userId in unseenNotifications) {
        if (userId !== user.id) {
          unseenNotifications[userId]++;
        }
      }

      // Broadcast the new event to all users
      io.emit('newEvent', event);
    });

    // Reset unseen notifications when the user views them
    socket.on('viewNotifications', () => {
      unseenNotifications[user.id] = 0;
    });
  }
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
  // Create Event
app.post('/api/events', (req, res) => {
  const { picture, title, time,descr, location,author, tags } = req.body;
  const sql = 'INSERT INTO events (picture, title, time, descr, location, author, tags) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [picture, title, time,descr, location,author, tags], (err, result) => {
      if (err) throw err;

      // Emit the news notification to relevant users
    if (tags.includes('#All')) {
      io.emit('recentEvents', { picture, title, time, descr, location, author, tags });
    } else {
      const tagRegex = new RegExp(tags.replace(/#/g, ''), 'i'); // Remove '#' and create regex
      UserModel.find({ email: { $regex: tagRegex } }).then(users => {
        users.forEach(user => {
          io.to(user._id.toString()).emit('recentEvents', { picture, title, time, descr, location, author, tags });
        });
      });
    }
      res.send('Event created...');
  });
});
// Get Latest 4 Events
app.get('/api/events', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY created_at DESC LIMIT 3';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Get All Events
app.get('/api/events/all', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});
// Get Latest 5 Events
app.get('/api/events/recent', verifyUser, (req, res) => {
  const userEmail = req.user.email.toLowerCase(); // Normalize the user's email to lowercase
  const sql = 'SELECT * FROM events ORDER BY created_at DESC LIMIT 5';

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Extract the first two words of the email
    const emailPrefix = userEmail.split('@')[0].split('.').slice(0, 2).join(' ');

    // Filter events based on tags
    const filteredEvents = results.filter(event => {
      const tags = event.tags || '';
      return (
        tags.toLowerCase().includes('#all') || // Show to all users if #All is present (case-insensitive)
        tags
          .toLowerCase()
          .split(',')
          .some(tag => emailPrefix.includes(tag.replace(/#/g, '').trim())) // Match email prefix with tags
      );
    });

    res.json(filteredEvents);
  });
});
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM events WHERE id = ?';
  db.query(sql, [id], (err, result) => {
      if (err) throw err;
      res.json(result[0]);
  });
});
// Get comments for an event
app.get('/api/events/:id/comments', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM comments WHERE event_id = ? ORDER BY created_at DESC';
  db.query(sql, [id], (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Add a comment to an event
app.post('/api/events/:id/comments', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const sql = 'INSERT INTO comments (event_id, comment, created_at) VALUES (?, ?, NOW())';
  db.query(sql, [id, comment], (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, event_id: id, comment, created_at: new Date() });
  });
});
// // Create New
// app.post('/api/news', (req, res) => {
//   const { picture, title, time,descr, location,categogies, tags,author } = req.body;
//   const sql = 'INSERT INTO news (picture, title, time, descr, location, categogies, tags, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
//   db.query(sql, [picture, title, time,descr, location,categogies, tags,author], (err, result) => {
//       if (err) throw err;

//       io.emit('newNew', { picture, title, time, descr, location,categogies, tags, author });

//       res.send('News created...');
//   });
// });
// // Get Latest 4 News
// app.get('/api/news', (req, res) => {
//   const sql = 'SELECT * FROM news ORDER BY created_at DESC LIMIT 3';
//   db.query(sql, (err, results) => {
//       if (err) throw err;
//       res.json(results);
//   });
// });

// // Get All Events
// app.get('/api/news/all', (req, res) => {
//   const sql = 'SELECT * FROM news ORDER BY created_at DESC';
//   db.query(sql, (err, results) => {
//       if (err) throw err;
//       res.json(results);
//   });
// });
// // Get Latest 5 Events
// app.get('/api/news/recent', (req, res) => {
//   const sql = 'SELECT * FROM news ORDER BY created_at DESC LIMIT 5';
//   db.query(sql, (err, results) => {
//       if (err) throw err;
//       res.json(results);
//   });
// });
// Create New
app.post('/api/news', (req, res) => {
  const { picture, title, time, descr, location, categories, tags, author } = req.body;
  const sql = 'INSERT INTO news (picture, title, time, descr, location, categories, tags, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [picture, title, time, descr, location, categories, tags, author], (err, result) => {
    if (err) throw err;

    // Emit the news notification to relevant users
    io.emit('newNews', { picture, title, time, descr, location, categories, tags, author });

    // Emit the news notification to relevant users
    if (tags.includes('#All')) {
      io.emit('recentNews', { picture, title, time, descr, location, categories, tags });
    } else {
      const tagRegex = new RegExp(tags.replace(/#/g, ''), 'i'); // Remove '#' and create regex
      UserModel.find({ email: { $regex: tagRegex } }).then(users => {
        users.forEach(user => {
          io.to(user._id.toString()).emit('recentNews', { picture, title, time, descr, location, categories, tags });
        });
      });
    }

    res.send('News created...');
  });
});
// Get Latest 4 News
app.get('/api/news', (req, res) => {
  const sql = 'SELECT * FROM news ORDER BY created_at DESC LIMIT 3';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Get All Events
app.get('/api/news/all', (req, res) => {
  const sql = 'SELECT * FROM news ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});
// Get Latest 5 Events
app.get('/api/news/recent', verifyUser, (req, res) => {
  const userEmail = req.user.email.toLowerCase(); // Normalize the user's email to lowercase
  const sql = 'SELECT * FROM news ORDER BY created_at DESC LIMIT 5';

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Extract the first two words of the email
    const emailPrefix = userEmail.split('@')[0].split('.').slice(0, 2).join(' ');

    // Filter news based on tags
    const filteredNews = results.filter(news => {
      const tags = news.tags || '';
      return (
        tags.toLowerCase().includes('#all') || // Show to all users if #All is present (case-insensitive)
        tags
          .toLowerCase()
          .split(',')
          .some(tag => emailPrefix.includes(tag.replace(/#/g, '').trim())) // Match email prefix with tags
      );
    });

    res.json(filteredNews);
  });
});
app.get('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM news WHERE id = ?';
  db.query(sql, [id], (err, result) => {
      if (err) throw err;
      res.json(result[0]);
  });
});
// Get comments for an event
app.get('/api/news/:id/comments', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM comments WHERE news_id = ? ORDER BY created_at DESC';
  db.query(sql, [id], (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Add a comment to an event
app.post('/api/news/:id/comments', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const sql = 'INSERT INTO comments (news_id, comment, created_at) VALUES (?, ?, NOW())';
  db.query(sql, [id, comment], (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, news_id: id,event_id:id, comment, created_at: new Date() });
  });
});
//////// Create Organisation
app.post('/api/org', (req, res) => {
  const { picture, title, time,linkweb,industry ,descr, location,categories, tags,contacter,position } = req.body;
  const sql = 'INSERT INTO organisation (picture, title, time,linkweb,industry ,descr, location,categories, tags,contacter,position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [picture, title, time,linkweb,industry ,descr, location,categories, tags,contacter,position], (err, result) => {
      if (err) throw err;

      io.emit('newOrg', { picture, title, time,linkweb,industry ,descr, location,categories, tags,contacter,position });

      res.send('Organisation created...');
  });
});
// Get Latest 4 Organisation
app.get('/api/org', (req, res) => {
  const sql = 'SELECT * FROM organisation ORDER BY created_at DESC LIMIT 3';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Get All Events
app.get('/api/org/all', (req, res) => {
  const sql = 'SELECT * FROM organisation ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});
// Get Latest 5 Events
app.get('/api/org/recent', (req, res) => {
  const sql = 'SELECT * FROM organisation ORDER BY created_at DESC LIMIT 5';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});
app.get('/api/org/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM organisation WHERE id = ?';
  db.query(sql, [id], (err, result) => {
      if (err) throw err;
      res.json(result[0]);
  });
});
// Get comments for an event
app.get('/api/org/:id/comments', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM comments WHERE org_id = ? ORDER BY created_at DESC';
  db.query(sql, [id], (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Add a comment to an event
app.post('/api/org/:id/comments', (req, res) => {o
  const { id } = req.params;
  const { comment } = req.body;
  const sql = 'INSERT INTO comments (org_id, comment, created_at) VALUES (?, ?, NOW())';
  db.query(sql, [id, comment], (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId,org_id:id ,news_id: id,event_id:id, comment, created_at: new Date() });
  });
});
    // Xử lý sự kiện disconnect    
    socket.on('disconnect', () => {
      onlineUser.delete(user?.mongoId)
      console.log("Disconnect user", socket.id);
    });

});
// Import the AlumniProfile model
app.get('/api/alumni', async (req, res) => {
  try {
    const alumniData = await AlumniProfile.find(); // Fetch all alumni data from MongoDB
    res.status(200).json(alumniData);
  } catch (error) {
    console.error('Error fetching alumni data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
app.put('/api/profile/:id',verifyUser, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    studentId,
    fullname,
    className,
    email,
    profilePic,
    degree,
    gpa,
    current_job,
    employer,
    position,
    location,
    experience,
    skills,
    interests,
    contact
  } = req.body;

  // Log the received data
  console.log("Received data:", req.body);

  // Validate the input
  if (!fullname || !email) {
    return res.status(400).json({ Error: "Fullname and email are required" });
  }

  try {
    // Update existing profile in MySQL
    const sql = 'UPDATE alumni SET student_id = ?, fullname = ?, class = ?, email = ?, profile_pic = ?, degree = ?, gpa = ?, current_job = ?, employer = ?, position = ?, location = ?, experience = ?, skills = ?, interests = ?, contact = ? WHERE id = ?';
    const values = [studentId, fullname, className, email, profilePic, degree, gpa, current_job, employer, position, location, experience, skills, interests, contact, id];
    await query(sql, values);

    // Update existing profile in MongoDB
    const updateResult = await AlumniProfile.findOneAndUpdate({ id }, {
      studentId,
      Name: fullname,
      className,
      Email: email,
      profilePic,
      degree,
      gpa,
      currentJob:current_job,
      employer,
      position,
      location,
      experience,
      skills,
      interests,
      contact
    }, { new: true });

    if (!updateResult) {
      console.error("Error updating profile in MongoDB: Profile not found");
      return res.status(404).json({ Error: "Profile not found in MongoDB" });
    }

    console.log("Profile updated successfully in MongoDB:", updateResult);

    return res.status(200).json({ Status: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return res.status(500).json({ Error: "Server error" });
  }
});
app.delete('/api/profile/:id',verifyUser, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Delete from MySQL
    const sql = 'DELETE FROM alumni WHERE id = ?';
    await query(sql, [id]);

    // Delete from MongoDB
    const deleteResult = await AlumniProfile.findOneAndDelete({ id });

    if (!deleteResult) {
      return res.status(404).json({ error: 'Profile not found in MongoDB' });
    }

    console.log('Profile deleted successfully:', deleteResult);
    return res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
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

app.post('/update-user', verifyUser, async (req, res) => {
  const { fullname, profile_pic } = req.body;

  // Kiểm tra dữ liệu
  if (!fullname) {
    return res.status(400).json({ Error: "Fullname is required" });
  }

  const mongoId = req.mongoId; // Lấy mongoId từ middleware

  try {
    // Tìm user trong MongoDB để lấy mysql_id
    const mongoUser = await UserModel.findById(mongoId);
    if (!mongoUser) {
      console.error('User not found in MongoDB:', mongoId);
      return res.status(404).json({ Error: "User not found in MongoDB" });
    }

    const mysqlId = mongoUser.mysql_id; // Lấy mysql_id từ MongoDB user

    // Ensure mysqlId is a number
    if (typeof mysqlId !== 'number') {
      console.error('Invalid MySQL ID:', mysqlId);
      return res.status(400).json({ Error: "Invalid MySQL ID" });
    }

    const sql = 'UPDATE login SET fullname = ?, profile_pic = ? WHERE id = ?';
    db.query(sql, [fullname, profile_pic || '', mysqlId], async (err, result) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ Error: "Database update error" });
      }

      if (result.affectedRows === 0) {
        console.warn('User not found for ID:', mysqlId);
        return res.status(404).json({ Error: "User not found" });
      }

      try {
        // Cập nhật thông tin user trong MongoDB
        const updatedUser = await UserModel.findByIdAndUpdate(
          mongoId,
          { 
            fullname: fullname,
            profile_pic: profile_pic || '' 
          },
          { new: true } // Trả về document đã được cập nhật
        );

        console.log('User details updated successfully for ID:', mysqlId);
        return res.json({
          Status: "Success",
          Message: "User details updated successfully",
          user: {
            _id: mongoId,
            fullname: updatedUser.fullname,
            profile_pic: updatedUser.profile_pic || '',
          },
        });
      } catch (mongoError) {
        console.error('Error updating MongoDB:', mongoError);
        return res.status(500).json({ Error: "Failed to update MongoDB" });
      }
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    return res.status(500).json({ Error: "Server error" });
  }
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

app.get('/api/users/mysql', async (req, res) => {
  const sql = 'SELECT id, fullname, email, role FROM login';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users from MySQL:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
app.get('/api/users/mongo', async (req, res) => {
  try {
    const users = await UserModel.find({}, 'fullname email role').lean();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users from MongoDB:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
app.put('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const sql = 'UPDATE login SET role = ? WHERE id = ?';
  db.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error('Error updating user role:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User role updated successfully' });
  });
});
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM login WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});
app.delete('/api/users/mongo/:id', async (req, res) => {
  const { id } = req.params; // MongoDB user ID
  try {
    const result = await UserModel.findByIdAndDelete(id); // Delete user by MongoDB ID
    if (!result) {
      return res.status(404).json({ error: 'User not found in MongoDB' });
    }
    res.status(200).json({ message: 'MongoDB user deleted successfully' });
  } catch (err) {
    console.error('Error deleting MongoDB user:', err.message);
    res.status(500).json({ error: 'Server error while deleting MongoDB user' });
  }
});
app.get('/api/news/related', (req, res) => {
  const { category, tags } = req.query;

  if (!category || !tags) {
    return res.status(400).json({ error: 'Category and tags are required' });
  }

  const sql = `
    SELECT * FROM news
    WHERE categories = ? OR tags LIKE ?
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(sql, [category, `%${tags}%`], (err, results) => {
    if (err) {
      console.error('Error fetching related news:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    res.status(200).json(results);
  });
});
// Get all outstanding individuals
app.get('/api/individuals', (req, res) => {
  const sql = 'SELECT * FROM individuals';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching individuals:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});

// Get a single individual by ID
app.get('/api/individuals/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM individuals WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching individual:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Add a new individual
app.post('/api/individuals', (req, res) => {
  const { name, role, description, image } = req.body;
  if (!name || !role || !description || !image) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const sql = 'INSERT INTO individuals (name, role, description, image) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, role, description, image], (err, result) => {
    if (err) {
      console.error('Error adding individual:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(201).json({ id: result.insertId, name, role, description, image });
  });
});

// Update an individual
app.put('/api/individuals/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, description, image } = req.body;
  if (!name || !role || !description || !image) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const sql = 'UPDATE individuals SET name = ?, role = ?, description = ?, image = ? WHERE id = ?';
  db.query(sql, [name, role, description, image, id], (err, result) => {
    if (err) {
      console.error('Error updating individual:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.status(200).json({ id, name, role, description, image });
  });
});

// Delete an individual
app.delete('/api/individuals/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM individuals WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting individual:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.status(200).json({ message: 'Individual deleted successfully' });
  });
});
// Increment views
app.post('/api/individuals/:id/increment-views', (req, res) => {
  console.log(`Incrementing views for individual ID: ${req.params.id}, IP: ${req.ip}`);
  const { id } = req.params;
  const sql = 'UPDATE individuals SET views = views + 1 WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error incrementing views:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.status(200).json({ success: true, message: 'Views incremented successfully' });
  });
});

// Increment likes
app.post('/api/individuals/:id/increment-likes', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE individuals SET likes = likes + 1 WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error incrementing likes:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.status(200).json({ success: true, message: 'Likes incremented successfully' });
  });
});
// Add a new vote
app.post('/api/votes', verifyUser, (req, res) => {
  const { eventId, vote } = req.body;
  const userId = req.user.id; // Assuming `verifyUser` middleware adds `req.user`

  console.log('User ID:', userId); // Debug log to check the value of userId

  if (!eventId || !vote) {
    return res.status(400).json({ error: 'Event ID and vote are required' });
  }

  // Check if the user has already voted for this event
  const checkSql = 'SELECT vote FROM votes WHERE user_id = ? AND event_id = ?';
  db.query(checkSql, [userId, eventId], (err, results) => {
    if (err) {
      console.error('Error checking existing vote:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      const currentVote = results[0].vote;

      if (currentVote === vote) {
        // If the vote is the same, do not update
        return res.status(200).json({ message: 'Vote remains unchanged' });
      }

      // Update the vote if it's different
      const updateSql = 'UPDATE votes SET vote = ? WHERE user_id = ? AND event_id = ?';
      db.query(updateSql, [vote, userId, eventId], (err, result) => {
        if (err) {
          console.error('Error updating vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(200).json({ message: 'Vote updated successfully' });
      });
    } else {
      // User has not voted yet, insert a new vote
      const insertSql = 'INSERT INTO votes (user_id, event_id, vote) VALUES (?, ?, ?)';
      db.query(insertSql, [userId, eventId, vote], (err, result) => {
        if (err) {
          console.error('Error adding vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(201).json({ message: 'Vote added successfully' });
      });
    }
  });
});
// Get vote counts for an event
app.get('/api/votes/:eventId', (req, res) => {
  const { eventId } = req.params;
  const sql = `
    SELECT 
      SUM(CASE WHEN vote = 'yes' THEN 1 ELSE 0 END) AS yesVotes,
      SUM(CASE WHEN vote = 'no' THEN 1 ELSE 0 END) AS noVotes
    FROM votes
    WHERE event_id = ?
  `;
  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching votes:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results[0]);
  });
});
app.post('/api/newsvotes', verifyUser, (req, res) => {
  const { newsId, vote } = req.body;
  const userId = req.user.id; // Assuming `verifyUser` middleware adds `req.user`

  console.log('User ID:', userId); // Debug log to check the value of userId

  if (!newsId || !vote) {
    return res.status(400).json({ error: 'News ID and vote are required' });
  }

  // Check if the user has already voted for this event
  const checkSql = 'SELECT vote FROM newsvotes WHERE user_id = ? AND news_id = ?';
  db.query(checkSql, [userId, newsId], (err, results) => {
    if (err) {
      console.error('Error checking existing vote:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      const currentVote = results[0].vote;

      if (currentVote === vote) {
        // If the vote is the same, do not update
        return res.status(200).json({ message: 'Vote remains unchanged' });
      }

      // Update the vote if it's different
      const updateSql = 'UPDATE newsvotes SET vote = ? WHERE user_id = ? AND news_id = ?';
      db.query(updateSql, [vote, userId, newsId], (err, result) => {
        if (err) {
          console.error('Error updating vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(200).json({ message: 'Vote updated successfully' });
      });
    } else {
      // User has not voted yet, insert a new vote
      const insertSql = 'INSERT INTO newsvotes (user_id, news_id, vote) VALUES (?, ?, ?)';
      db.query(insertSql, [userId, newsId, vote], (err, result) => {
        if (err) {
          console.error('Error adding vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(201).json({ message: 'Vote added successfully' });
      });
    }
  });
});
// Get vote counts for an event
app.get('/api/newsvotes/:newsId', (req, res) => {
  const { newsId } = req.params;
  const sql = `
    SELECT 
      SUM(CASE WHEN vote = 'yes' THEN 1 ELSE 0 END) AS yesVotes,
      SUM(CASE WHEN vote = 'no' THEN 1 ELSE 0 END) AS noVotes
    FROM newsvotes
    WHERE news_id = ?
  `;
  db.query(sql, [newsId], (err, results) => {
    if (err) {
      console.error('Error fetching votes:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results[0]);
  });
});

app.post('/api/orgvotes', verifyUser, (req, res) => {
  const { orgId, vote } = req.body;
  const userId = req.user.id; // Assuming `verifyUser` middleware adds `req.user`

  console.log('User ID:', userId); // Debug log to check the value of userId

  if (!orgId || !vote) {
    return res.status(400).json({ error: 'Organisation ID and vote are required' });
  }

  // Check if the user has already voted for this event
  const checkSql = 'SELECT vote FROM orgvotes WHERE user_id = ? AND org_id = ?';
  db.query(checkSql, [userId, orgId], (err, results) => {
    if (err) {
      console.error('Error checking existing vote:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      const currentVote = results[0].vote;

      if (currentVote === vote) {
        // If the vote is the same, do not update
        return res.status(200).json({ message: 'Vote remains unchanged' });
      }

      // Update the vote if it's different
      const updateSql = 'UPDATE orgvotes SET vote = ? WHERE user_id = ? AND org_id = ?';
      db.query(updateSql, [vote, userId, orgId], (err, result) => {
        if (err) {
          console.error('Error updating vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(200).json({ message: 'Vote updated successfully' });
      });
    } else {
      // User has not voted yet, insert a new vote
      const insertSql = 'INSERT INTO orgvotes (user_id, org_id, vote) VALUES (?, ?, ?)';
      db.query(insertSql, [userId, orgId, vote], (err, result) => {
        if (err) {
          console.error('Error adding vote:', err.message);
          return res.status(500).json({ error: 'Server error' });
        }
        return res.status(201).json({ message: 'Vote added successfully' });
      });
    }
  });
});
// Get vote counts for an event
app.get('/api/orgvotes/:orgId', (req, res) => {
  const { orgId } = req.params;
  const sql = `
    SELECT 
      SUM(CASE WHEN vote = 'yes' THEN 1 ELSE 0 END) AS yesVotes,
      SUM(CASE WHEN vote = 'no' THEN 1 ELSE 0 END) AS noVotes
    FROM orgvotes
    WHERE org_id = ?
  `;
  db.query(sql, [orgId], (err, results) => {
    if (err) {
      console.error('Error fetching votes:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results[0]);
  });
});

// Endpoint to handle voting for alumni
app.post('/api/alumni/:id/vote', async (req, res) => {
  const { id } = req.params;

  try {
    // Increment the vote count for the specified alumni in the MySQL table
    const sql = 'UPDATE alumni SET votes = COALESCE(votes, 0) + 1 WHERE id = ?';
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error recording vote:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to fetch top 3 individuals with the highest votes
app.get('/api/top-voted', async (req, res) => {
  try {
    const sql = `
      SELECT id, fullname, profile_pic, degree, votes
      FROM alumni
      ORDER BY votes DESC
      LIMIT 3
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching top-voted alumni:', err.message);
        return res.status(500).json({ error: 'Server error' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching top-voted alumni:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/votes-by-major-year', async (req, res) => {
  const sql = `
    SELECT 
      SUBSTRING(student_id, 1, 2) AS year, 
      SUBSTRING(student_id, 3, 2) AS major, 
      SUM(votes) AS total_votes
    FROM alumni
    WHERE votes IS NOT NULL
    GROUP BY year, major
    ORDER BY year, major;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching votes data:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
app.get('/api/votes-year', (req, res) => {
  const sql = `
    SELECT 
      SUBSTRING(student_id, 7, 2) AS year, -- Extract the year from the 7th and 8th characters of student_id
      SUM(votes) AS total_votes
    FROM alumni
    WHERE votes IS NOT NULL
    GROUP BY year
    ORDER BY year;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching votes data by year:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error saving contact message:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(201).json({ message: 'Message saved successfully' });
  });
});app.get('/api/contact', (req, res) => {
  const sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching contact messages:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});


app.get('/api/contact/range', (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT * 
    FROM contact_messages 
    WHERE DATE(created_at) BETWEEN ? AND ?
    ORDER BY created_at ASC
  `;
  db.query(sql, [startDate, endDate], (err, results) => {
    if (err) {
      console.error('Error fetching range messages:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});
// Endpoint to handle voting

// Bắt đầu server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});