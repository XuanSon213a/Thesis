import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Clone from '../../../assets/images/clone.jpg';
import axios from 'axios';
import Logo from "../../../assets/images/logoiu.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const ContactIcon = <FontAwesomeIcon icon={faQuestion} />;

interface Alumni {
  id: string;
  "No.": number;
  student_id: string;
  fullname: string;
  class: string;
  email: string;
  profile_pic: string;  
  degree: string;
  gpa: string;
  current_job: string;
  employer: string;
  position: string;
  location: string;
  experience: string;
  skills: string;
  interests: string;
  contact: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.user);
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Alumni | null>(null);
  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [showSkills, setShowSkills] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`http://localhost:3300/api/alumni/${id}`);
        setAlumni(response.data);
      } catch (error) {
        console.error('Error fetching alumni data:', error);
      }
    };

    fetchAlumni();
  }, [id]);

  if (!alumni) {
    return <div>Alumni not found</div>;
  }

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData(alumni);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value } as Alumni);
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.put(`http://localhost:3300/api/profile/${id}`, formData);
      if (response.status === 200 || response.status === 201) {
        console.log('Profile updated successfully');
        setAlumni(formData); // Update the displayed data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    try {
      const response = await axios.delete(`http://localhost:3300/api/profile/${id}`);
      if (response.status === 200) {
        console.log('Profile deleted successfully');
        setShowNotification(true); // Show success notification
        setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
        console.log('Alumni deleted successfully');
        navigate('/inv');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };
  const handleVoteClick = async () => {
    try {
      const response = await axios.post(`http://localhost:3300/api/alumni/${alumni.id}/vote`);
      if (response.status === 200) {
        setVoteCount(voteCount + 1); // Increment the vote count locally
        setShowNotification(true); // Show the notification
        setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
        console.log('Vote recorded successfully');
      }
    } catch (error) {
      console.error('Error recording vote:', error);
    }
  };
  return (
    <>
      {/* Header */}
      <div className="header bg-[#2f398e]">
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10">
          <Link to={'/'}><img src={Logo} className="w-60 md:w-70 rounded-lg" alt="logo" /></Link>
          <Link to={'/'} className="text-2xl md:text-4xl text-white font-mono font-bold hover:underline mt-4 md:mt-0">Alumni's IU Network</Link>
          <div className="header-right mt-4 md:mt-0">
            {/* Add authentication logic here if needed */}
          </div>
        </div>
      </div>
      {/* Notification */}
      {showNotification && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
                Vote recorded successfully!
              </div>
              
            )}
      {/* Profile Page Content */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isEditing ? (
            <div className="p-6 space-y-4">
              <input
                type="text"
                name="fullname"
                value={formData?.fullname || ''}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="current_job"
                value={formData?.current_job || ''}
                onChange={handleInputChange}
                placeholder="Current Job"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="employer"
                value={formData?.employer || ''}
                onChange={handleInputChange}
                placeholder="Employer"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="position"
                value={formData?.position || ''}
                onChange={handleInputChange}
                placeholder="Position"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="location"
                value={formData?.location || ''}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="degree"
                value={formData?.degree || ''}
                onChange={handleInputChange}
                placeholder="Degree"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="experience"
                value={formData?.experience || ''}
                onChange={handleInputChange}
                placeholder="Experience"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="skills"
                value={formData?.skills || ''}
                onChange={handleInputChange}
                placeholder="Skills"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="interests"
                value={formData?.interests || ''}
                onChange={handleInputChange}
                placeholder="Interests"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="contact"
                value={formData?.contact || ''}
                onChange={handleInputChange}
                placeholder="Contact"
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleSaveClick}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={alumni.profile_pic || Clone}
                  alt={alumni.fullname}
                  className="w-48 h-48 object-cover rounded-full"
                />
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{alumni.fullname}</h2>
                  <p className="text-gray-600 font-semibold">Current Jobs: {alumni.current_job}</p>
                  <p className="text-gray-600 font-semibold">Employer: {alumni.employer}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Information */}
                <div className="space-y-2">
                  <p><span className="font-semibold">Student ID:</span> {alumni.student_id}</p>
                  <p><span className="font-semibold">Class:</span> {alumni.class}</p>
                  <p><span className="font-semibold">Email:</span> {alumni.email}</p>
                  <p><span className="font-semibold">Degree:</span> {alumni.degree}</p>
                  <p><span className="font-semibold">GPA:</span> {alumni.gpa}</p>
                  <p><span className="font-semibold">Position:</span> {alumni.position}</p>
                  <p><span className="font-semibold">Location:</span> {alumni.location}</p>
                  <p><span className="font-semibold">Experience:</span> {alumni.experience}</p>
                </div>

                {/* Right Column: Skills, Interests, Contact */}
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                  {/* Skills Section */}
                  <div
                    className="relative group"
                    onClick={() => setShowSkills(!showSkills)}
                    onMouseEnter={() => setShowSkills(true)}
                    onMouseLeave={() => setShowSkills(false)}
                  >
                    <p className="font-semibold cursor-pointer hover:text-blue-500">
                      Skills: <span className="text-gray-600">{alumni.skills.split(',').slice(0, 2).join(', ')}...</span>
                    </p>
                    {showSkills && (
                      <div className="absolute left-full ml-2 p-2 bg-white border rounded shadow-lg w-48 z-10">
                        <p className="text-gray-600">{alumni.skills}</p>
                      </div>
                    )}
                  </div>

                  {/* Interests Section */}
                  <div
                    className="relative group"
                    onClick={() => setShowInterests(!showInterests)}
                    onMouseEnter={() => setShowInterests(true)}
                    onMouseLeave={() => setShowInterests(false)}
                  >
                    <p className="font-semibold cursor-pointer hover:text-blue-500">
                      Interests: <span className="text-gray-600">{alumni.interests.split(',').slice(0, 2).join(', ')}...</span>
                    </p>
                    {showInterests && (
                      <div className="absolute left-full ml-2 p-2 bg-white border rounded shadow-lg w-48 z-10">
                        <p className="text-gray-600">{alumni.interests}</p>
                      </div>
                    )}
                  </div>

                   {/* Contact Section */}
                   <div
                    className="relative group"
                    onClick={() => setShowContact(!showContact)}
                    onMouseEnter={() => setShowContact(true)}
                    onMouseLeave={() => setShowContact(false)}
                  >
                    <p className="font-semibold cursor-pointer hover:text-blue-500">
                      Contact: <span className="text-gray-600">{alumni.contact.slice(0, 10)}...</span>
                    </p>
                    {showContact && (
                      <div className="absolute left-full ml-2 p-2 bg-white border rounded shadow-lg w-48 z-10">
                        <p className="text-gray-600">{alumni.contact}</p>
                      </div>
                    )}
                  </div>
                  

                </div>
                
              </div>
              <div className="mt-6 flex space-x-4">
              {user.role === 'admin' && (
    <>
      <button
        onClick={handleEditClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={handleDeleteClick}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </>
  )}
  <button
    onClick={handleVoteClick}
    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
  >
    Vote for OutStanding Alumni 
  </button>
              
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer bg-[#2f398e]">
        <div className="border-t-2 border-solid">
          <div className="flex flex-col md:flex-row items-center justify-between font-mono p-4 md:p-10">
            <Link to={'/'}><img src={Logo} className="w-40 rounded-lg" alt="logo" /></Link>
            <div className="flex flex-col md:flex-row items-center justify-between font-mono p-4 md:p-10">
                         
                          <section className="my-2 p-4 md:p-10 bg-[#EDE8E0] rounded -lg shadow-md">
                                <div className="text-center">
                                  <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
                                    <h2 className="text-2xl md:text-3xl font-mono font-bold">Contact Us:</h2>
                                    <p className="text-lg md:text-xl font-mono mt-2">Mon-Fri | 9AM-5PM</p>
                                    <p className="text-lg md:text-xl font-mono mt-2">IU Alumni Vietnam</p>
                                    <p className="text-lg md:text-xl font-mono mt-2">
                                      <a href="https://www.linkedin.com/in/rmit-alumni-vietnam" target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
                                      </a>
                                    </p>
                                    <p className="text-lg md:text-xl font-mono mt-2">
                                      <a href="mailto:alumni@mrt.edu.vn">
                                        <FontAwesomeIcon icon={faEnvelope} /> IUalumni@iu.edu.vn
                                      </a>
                                    </p>
                                  </div>
                                </div>
                          </section>
                      </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default ProfilePage;