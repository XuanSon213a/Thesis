import React from 'react';
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface AvatarProps {
  userId: string;
  fullname?: string;
  imageUrl?: string;
  width: number;
  height: number;
 
}

const Avatar: React.FC<AvatarProps> = ({ userId, fullname, imageUrl, width, height }) => {
  // Lấy danh sách người dùng trực tuyến từ Redux
  const onlineUser = useSelector((state: RootState) => state?.user?.onlineUser);
  
  // Tạo chữ viết tắt của tên
  let avatarName: string = "";
  
  if (fullname) {
    const splitName = fullname.split(" ");
    avatarName = splitName.map((n) => n[0]).join("");
    if (splitName.length > 1) {
      avatarName = splitName[0][0] + splitName[1][0]; // Hai chữ cái đầu tiên của hai từ
    } else {
      avatarName = splitName[0][0]; // Chỉ có một từ, lấy chữ cái đầu tiên
    }
  }

  // Các màu nền ngẫu nhiên cho avatar
  const bgColor = [
    // 'bg-slate-200',
    // 'bg-teal-200',
    // 'bg-red-200',
    // 'bg-green-200',
    // 'bg-yellow-200',
    // 'bg-gray-200',
    // 'bg-cyan-200',
    // 'bg-sky-200',
    'bg-blue-200'
  ];

  // Chọn màu nền ngẫu nhiên
  const randomNumber = Math.floor(Math.random() * bgColor.length);

  // Kiểm tra xem người dùng có online hay không
  const isOnline = onlineUser?.includes(String(userId)) 

  return (
    <div className={`text-slate-800 rounded-full font-bold relative`} style={{ width: width + "px", height: height + "px" }}>
      {
        imageUrl ? (
          <img
            src={imageUrl}
            width={width}
            height={height}
            alt={fullname}
            className='overflow-hidden rounded-full'
          />
        ) : (
          fullname ? (
            <div style={{ width: width + "px", height: height + "px" }} className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`}>
              {avatarName}
            </div>
          ) : (
            <PiUserCircle
              size={width}
            />
          )
        )
      }

      {/* Hiển thị chấm trạng thái online nếu người dùng đang trực tuyến */}
      {
        isOnline && (
          <div className='bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
        )
      }
    </div>
  );
}

export default Avatar;
