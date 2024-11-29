import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from "./Theme/Sidebar";
import logoicon from '../../assets/images/LogoHCMIU.svg';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../../redux/userSlice.tsx';
import store, { RootState } from '../../redux/store.tsx'; // Import RootState type
import axios from "axios";

function MessagePage() {  
  const user = useSelector((state: RootState) => state.user); 
  
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  console.log("user", user);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios({
          url: 'http://localhost:3300/user-details', // Endpoint của API
          withCredentials: true,
        });

        const userDetails = response.data.user;

        if (userDetails) {
          dispatch(
            setUser({
              id: userDetails.mysql_id?.toString(),
              mongoId: userDetails._id,
              fullname: userDetails.fullname,
              email: userDetails.email,
              profile_pic: userDetails.profile_pic,
              role: userDetails.role || "", // Nếu có role thì sử dụng, nếu không để trống
            })
          );
        } else {
          // Điều hướng đến trang đăng nhập nếu không có thông tin người dùng
          dispatch(logout());
          // navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [dispatch]);
  /***socket connection */
  useEffect(() => {
    
        
        const token = localStorage.getItem('token'); // Retrieve token from localStorage or another storage method

    if (!token) {
      console.error("Token is missing. Please log in again.");
    } else {
      console.log("Token found:", token); // Log the token for debugging
    }

const socketConnection = io('http://localhost:3300', {
  transports: ['websocket'],
  withCredentials: true,
  auth: {
    token: token, // Send the token with the connection
  },
});
    socketConnection.on('onlineUser', (data) => {
      console.log('data',data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch]);

  // Check if we are at the base path of /message/:id
  const isBasePath = location.pathname === `/message/${id}`;
  const isChatPath = location.pathname === `/message/${id}/chat`;

  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      {/* Sidebar Section */}
      <section className={`bg-white ${!isBasePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/* Default Logo and Text Section */}
      {isBasePath && (
        <div className={`justify-center items-center flex-col gap-2 hidden ${!isBasePath ? "hidden" : "lg:flex"}`}>
          <img src={logoicon} width={250} alt="logoicon" />
          <p className="text-lg mt-2 text-slate-500">Select user to send message</p>
        </div>
      )}

      {/* Chat Content Section */}
      {isChatPath && (
        <section className="w-full h-full bg-gray-400">
          <Outlet />
        </section>
      )}
    </div>
  );
}

export default MessagePage;
