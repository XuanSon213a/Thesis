import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlumniManagement: React.FC = () => {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    profile_pic: '',
    degree: '',
    gpa: '',
    current_job: '',
    employer: '',
    position: '',
    location: '',
    experience: '',
    skills: '',
    interests: '',
    contact: ''
  });

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await axios.get('/api/alumni');
      setAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/profile', formData);
      fetchAlumni();
    } catch (error) {
      console.error('Error adding alumni:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/alumni/${id}`);
      fetchAlumni();
    } catch (error) {
      console.error('Error deleting alumni:', error);
    }
  };

  return (
    <div className="alumni-management">
      <h2 className="text-2xl font-bold mb-6">Alumni Management</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} placeholder="Fullname" required />
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
        <input type="text" name="profile_pic" value={formData.profile_pic} onChange={handleInputChange} placeholder="Profile Pic" />
        <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="Degree" />
        <input type="text" name="gpa" value={formData.gpa} onChange={handleInputChange} placeholder="GPA" />
        <input type="text" name="current_job" value={formData.current_job} onChange={handleInputChange} placeholder="Current Job" />
        <input type="text" name="employer" value={formData.employer} onChange={handleInputChange} placeholder="Employer" />
        <input type="text" name="position" value={formData.position} onChange={handleInputChange} placeholder="Position" />
        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" />
        <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Experience" />
        <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="Skills" />
        <input type="text" name="interests" value={formData.interests} onChange={handleInputChange} placeholder="Interests" />
        <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Contact" />
        <button type="submit">Add Alumni</button>
      </form>
      <ul>
        {alumni.map((alumnus) => (
          <li key={alumnus['Student ID']}>
            {alumnus.Name} - {alumnus.Class}
            <button onClick={() => handleDelete(alumnus['Student ID'])}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlumniManagement;