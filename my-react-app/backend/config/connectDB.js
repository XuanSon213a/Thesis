import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Không cần tùy chọn useNewUrlParser và useUnifiedTopology
    
      
      console.log('Connected to MongoDB');
  
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Dừng server nếu không kết nối được
    }
}

export default connectDB;
