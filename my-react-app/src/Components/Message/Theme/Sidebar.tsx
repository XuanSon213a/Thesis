import React, { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { IoMdChatboxes } from 'react-icons/io';
import { BiLogOut } from 'react-icons/bi';
import { FiArrowUpLeft } from "react-icons/fi";
import logoicon from '../../../assets/images/LogoHCMIU.svg';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../../Components/AluminiList/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import EditUserDetail from './EditUserDetail';
import { logout } from '../../../redux/userSlice';
import SearchUser from '../../Message/Theme/SearchUser';
import { FaUserPlus } from "react-icons/fa";

interface StudentData {
  No: number;
  'Student ID': string;
  Name: string;
  Class: string;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [allUser, setAllUser] = useState([]);
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.user);
  const onlineUser = useSelector((state: RootState) => state?.user?.onlineUser);
  
  // Lấy thông tin người dùng từ Redux
  
  useEffect(() => {
    // Fetch dữ liệu sinh viên từ db.json
    fetch('/db.json')
      .then((response) => response.json())
      .then((data) => setStudents(data.failureData || [])) // Lấy failureData từ JSON
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleLogout = () => {
    navigate('/');
    dispatch(logout());
    localStorage.clear(); // Xóa dữ liệu session
  };

  // Tìm sinh viên dựa vào Student ID trong URL
  const selectedStudent = students.find(
    (student) => student['Student ID'] === id
  );
  console.log('Sidebar: Online users:', onlineUser);
  return (
    <div className="w-full h-full grid grid-cols-[48px,1fr] bg-white">
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
        <div>
          <Link to="/">
            <img src={logoicon} className="w-70 rounded-lg" alt="logo" />
          </Link>

          {/* Hiển thị avatar cho sinh viên được chọn */}
          {selectedStudent ? (
            <div className="student-item flex items-center gap-4 pt-10 pb-10 pl-1">
              <Avatar
                userId={selectedStudent['Student ID']}
                fullname={selectedStudent.Name}
                width={40}
                height={40}
              />
              
            </div>
            
          ) : (
            <p className="text-sm text-gray-500 mt-4 text-center"></p>
            
          )}

          {/* Nút Chat */}
          <NavLink
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${
                isActive ? 'bg-slate-200' : ''
              }`
            }
            title="chat"
            to=""
          >
            <IoMdChatboxes size={25} />
          </NavLink>

          {/* Nút Add Friend */}
          <div
            title="add friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <FaUserPlus size={20} />
          </div>
        </div>

        {/* Avatar và thông tin người dùng đã đăng nhập */}
        {/* Avatar and user details */}
        <div className="flex items-center flex-col gap-4 mt-5">
          <button
            className="mx-auto"
            title={user?.fullname}
            onClick={() => setEditUserOpen(true)}
          >
            {user && (
              <>
                <Avatar
                  userId={user?.id} 
                  fullname={user?.fullname || 'User'}
                  imageUrl={user?.profile_pic || ''}
                  width={40}
                  height={40}
                />
                <p className="text-sm text-center text-gray-700 mt-1">{user?.fullname}</p>
              </>
            )}
          </button>
        </div>


        {/* Nút Logout */}
        <div>
          <button
            title="logout"
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
            onClick={handleLogout}
          >
            <span className="-ml-2">
              <BiLogOut size={25} />
            </span>
          </button>
        </div>
      </div>

      {/* Message Section */}
      <div className="w-full">
        <div className="h-16 flex items-center">
          <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>
        <div className="bg-cyan-100 h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
          {allUser.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-slate-500">
                <FiArrowUpLeft size={50} />
              </div>
              <p className="text-lg text-center text-slate-400">
                Explore users to start a conversation with.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin người dùng */}
      {editUserOpen && (
        <EditUserDetail onClose={() => setEditUserOpen(false)} user={user} />
      )}

      {/* Search User Modal */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} 
        students={students} 
        
        />
        
      )}
    </div>
  );
};

export default Sidebar;
