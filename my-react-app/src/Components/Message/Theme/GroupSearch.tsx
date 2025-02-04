import React from 'react';
import Avatar from '../../AluminiList/Avatar';
import { Link } from 'react-router-dom';

interface User {
  mongoId: string;
  fullname: string;
  email?: string;
  profile_pic?: string;
}

interface GroupSearchProps {
  userId: string;
  name: string;
  email?: string;
  profile_pic?: string;
  onClose: () => void;
  handleSelect?: (userId: string) => void;
  handleDeselect?: (userId: string) => void;
  selectedUsers: string[];
}

const GroupSearch: React.FC<GroupSearchProps> = ({
  userId,
  name,
  email,
  profile_pic,
  onClose,
  handleSelect,
  handleDeselect,
  selectedUsers,
}) => {
  // Kiểm tra nếu người dùng đã được chọn
  const isSelected = selectedUsers.includes(userId);

  return (
    <div className="flex items-center justify-between p-2 lg:p-4 border border-transparent border-b-slate-200 hover:border hover:border-primary rounded cursor-pointer">
      <Link
        to={`/message/${userId}/chat`}
        onClick={onClose}
        className="flex items-center gap-3 w-full"
      >
        <div>
          <Avatar
            width={50}
            height={50}
            fullname={name}
            userId={userId}
            imageUrl={profile_pic}
          />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-ellipsis line-clamp-1">{name}</div>
          {email && (
            <p className="text-sm text-ellipsis line-clamp-1 text-gray-500">
              {email}
            </p>
          )}
        </div>
      </Link>

      {/* Hiển thị dấu cộng (chọn) hoặc dấu "x" (bỏ chọn) */}
      <div className="flex items-center justify-center">
        {!isSelected ? (
          <button
            className="text-green-500 hover:bg-green-100 p-1 rounded"
            onClick={() => handleSelect && handleSelect(userId)}
          >
            +
          </button>
        ) : (
          <button
            className="text-red-500 hover:bg-red-100 p-1 rounded"
            onClick={() => handleDeselect && handleDeselect(userId)}
          >
            &#10005;
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupSearch;
