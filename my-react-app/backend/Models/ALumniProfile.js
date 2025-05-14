import mongoose from 'mongoose';

const alumnisSchema = new mongoose.Schema({
  id: Number,
  studentId: String,
  Name: String,
  className: String,
  Email: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  degree: { type: String, default: '' },
  gpa: { type: String, default: '' },
  currentJob: { type: String, default: '' },
  employer: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  experience: { type: String, default: '' },
  skills: { type: String, default: '' },
  interests: { type: String, default: '' },
  contact: { type: String, default: '' }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

const AlumniProfile = mongoose.model('ProfileDetailsss', alumnisSchema);
export default AlumniProfile;