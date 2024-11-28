import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@images/logoiu.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  
  faQuestion
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import alumnisData from '../../../backend/db.json';
import Clone from '../../assets/images/clone.jpg';
import { Alumni } from "../../types/Alumni"; // Đường dẫn đến file interface
import Import from './Import';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';


const ContactIcon = <FontAwesomeIcon icon={faQuestion} />;

const Individuals: React.FC = () => {
  // const [selectedValue, setSelectedValue] = useState('');
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // Add role state
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user); 
  const userId = user?._id;
  // Thiết lập mặc định cho axios
  axios.defaults.withCredentials = true;

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedValue(e.target.value); // Cập nhật state khi select thay đổi
  // };

  useEffect(() => {
    axios
      .get('http://localhost:3300/page', { withCredentials: true }) // Đảm bảo port đúng
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(true);
          setName(res.data.name);
          setRole(res.data.role); // Store the role
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = () => {
    axios
      .get('http://localhost:3300/logout', { withCredentials: true }) // Sử dụng đúng API route
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(false); // Cập nhật trạng thái đăng xuất
          navigate('/'); // Chuyển hướng đến trang đăng nhập
        }
      })
      .catch((err) => console.log(err));
  };

  // Kết hợp successData và failureData
  const combinedAlumnis: Alumni[] = [
    ...(alumnisData.successData || []),
    ...(alumnisData.failureData || [])
  ];
  const handleMessageClick = (alumni: Alumni) => {
    navigate('/message', { state: { alumni } }); // Truyền dữ liệu alumni sang trang Message
  };
  return (
    <>
      {/* Header */}
      <div className="header bg-[#2f398e]">
        <div className="flex items-center justify-between p-10">
          <Link to={'/'}>
            <img src={logo} className="w-70 rounded-lg" alt="logo" />
          </Link>
          <Link
            to={'/'}
            className="text-4xl text-white font-mono font-bold hover:underline"
          >
            Alumni's IU Network
          </Link>
          <div className="header-right">
            {auth ? (
              <div>
                <button
                  className="align-middle select-none text-center ml-10 py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10"
                  onClick={handleDelete}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <h3>{message}</h3>
                <Link
                  className="align-middle select-none text-center ml-10 py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10"
                  to={'login'}
                >
                  Login
                </Link>
                <Link to={'register'}>
                  <button className="align-middle select-none text-center ml-10 py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 p-6">
        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by..."
            className="p-2 rounded border border-gray-300 w-1/2"
          />
          <button className="ml-2 bg-red-500 text-white p-2 rounded">
            Search
          </button>
        </div>

        {/* Description */}
        <p className="text-center mb-6 text-gray-600">
          The individual is the member directory. It allows alumni members to
          search, view, and connect with each other on an individual basis...
        </p>

        {/* Conditionally render upload section if admin */}
        {role === 'admin' && (
          <div className="upload-section bg-white p-4 rounded-lg shadow mb-6 ">
            <Import/>
          </div>
        )}

        {/* Alumnis Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {combinedAlumnis.map((member, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <img
                  src={Clone}
                  alt={member.Name}
                  className="w-full h-60 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-bold mb-2 text-center">
                  {member["No."]}
                </h2>

                <Link
                  to={`/member/${member["No."]}`}
                  className="text-right text-blue-600 font-semibold mb-2"
                >
                  {member.Name}
                </Link>
                
                <p className="text-gray-500 mb-4">{member["Student ID"]}</p>
                <p className="text-sm text-gray-400 text-center">
                   {member.Class}
                </p>
                <Link
                    to={`/message/${member["Student ID"]}`} // Truyền Student ID qua URL
                    className="text-right text-blue-600 font-semibold mb-2"
                  >
                    Message with Alumni
                </Link><br></br>
                <Link
                    to={`/message/${userId}chat`} 
                    className="text-right text-blue-600 font-semibold mb-2"
                  >
                    Message 
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="footer bg-[#2f398e]">
        <div className="border-t-2 border-solid">
          <div className="flex items-center justify-between p-10">
            <Link to={'/'}>
              <img src={logo} className="w-40 rounded-lg" alt="logo" />
            </Link>
            <Link to={'contact'}>
              Contact {ContactIcon}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Individuals;
