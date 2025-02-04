import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import GroupSearch from '../../Message/Theme/GroupSearch';
import Loading from './Loading';
import { RootState } from '../../../redux/store';
import Avatar from '../../AluminiList/Avatar';
import { useNavigate } from 'react-router-dom';
interface CreateGroupProps {
  onClose: () => void;
}
interface Group {
  _id: string;
  fullname: string;
  profile_pic?: string;
  members: string[];
  messages: string[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationUser {
  id: string;
  isGroup: boolean;
  userDetails: {
    _id: string;
    fullname: string;
    profile_pic?: string;
    isGroup: boolean;
  };
  lastMsg?: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  }|null;
  unseenMsg: number;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onClose }) => {
  const [groupName, setGroupName] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<
    { userId: string; name: string; profile_pic?: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socketConnection = useSelector((state: RootState) => state?.user?.socketConnection);
  const user = useSelector((state: RootState) => state.user);
  const [allUser, setAllUser] = useState<ConversationUser[]>([]);
  const navigate = useNavigate();
  // Tìm kiếm người dùng qua API
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3300/search-user', {
        search: searchQuery,
      });
      setLoading(false);
      setSearchResults(response.data.data || []);
    } catch (error: unknown) {
      setLoading(false);
      console.error("Error during search:", error);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error fetching search results");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Gọi API mỗi khi `searchQuery` thay đổi
  useEffect(() => {
    handleSearchUser();
  }, [searchQuery]);

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleUserSelect = (userId: string, name: string, profile_pic?: string) => {
    if (!selectedUsers.some((user) => user.userId === userId)) {
      setSelectedUsers([...selectedUsers, { userId, name, profile_pic }]);
    }
  };

  const handleUserDeselect = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.userId !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error('Please provide a group name and select at least one member.');
      return;
    }
  
    const members = selectedUsers.map((user) => user.userId);

    if (!socketConnection) {
      toast.error('Socket connection not available!');
      return;
    }

    // Gửi sự kiện tạo nhóm qua socket
    socketConnection.emit(
      'create-group',
      { fullname: groupName, members },
      (response: { error?: string; group?: Group }) => {
        if (response?.error) {
          toast.error(response.error);
          return;
        }

        toast.success('Group created successfully!');
        console.log('Group created:', response.group);

        // Điều hướng tới nhóm mới
        if (response.group?._id) {
          navigate(`/message/${response.group._id}`);
        }
        onClose();
      }
    );
  };

  // Lắng nghe sự kiện 'group-created' từ server
  useEffect(() => {
    if (!socketConnection) return;

    const handleGroupCreated = (group: Group) => {


      console.log('New group created via event:', group);
setAllUser((prevAllUser) => [
    ...prevAllUser,
    {
      id: group._id, // ID của nhóm
      isGroup: true,
      userDetails: {
        _id: group._id,
        fullname: group.fullname, // Tên nhóm
        profile_pic: group.profile_pic || "", // Avatar nhóm
        isGroup: true,
      },
      lastMsg: null, // Tin nhắn cuối cùng (mặc định là null)
      unseenMsg: 0, // Số tin nhắn chưa đọc (mặc định là 0)
    },
  ]);
      
      // Điều hướng đến nhóm mới
      navigate(`/message/${group._id}/chat`);
      onClose();
      toast.success(`Group "${group.fullname}" created successfully!`);
    };

    socketConnection.on('group-created', handleGroupCreated);

    return () => {
      socketConnection.off('group-created', handleGroupCreated);
    };
  }, [socketConnection, navigate, onClose]);
  
  
  

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10">
      <div className="w-full max-w-lg mx-auto mt-10 bg-white p-4 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">Create Group</h2>
          <button className="text-2xl hover:text-red-600" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        {/* Nhập tên nhóm */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Group Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={groupName}
            onChange={handleGroupNameChange}
            placeholder="Enter group name"
          />
        </div>

        {/* Tìm kiếm người dùng */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Search Users</label>
          <div className="flex items-center border p-2 rounded">
            <IoSearchOutline size={20} className="mr-2" />
            <input
              type="text"
              className="w-full outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users"
            />
          </div>

          {/* Hiển thị kết quả tìm kiếm */}
          <div className="mt-2 max-h-40 overflow-y-auto">
            {loading && (
              <div className="flex justify-center items-center">
                <Loading />
              </div>
            )}
            {!loading && searchResults.length === 0 && searchQuery.trim() && (
              <p className="text-center text-slate-500">No users found!</p>
            )}
            {!loading &&
              searchResults.map((foundUser) => (
                <GroupSearch
                  key={foundUser._id}
                  userId={foundUser._id}
                  name={foundUser.fullname}
                  profile_pic={foundUser.profile_pic}
                  onClose={onClose}
                  handleSelect={(id) =>
                    handleUserSelect(id, foundUser.fullname, foundUser.profile_pic)
                  }
                  handleDeselect={(id) => handleUserDeselect(id)}
                  selectedUsers={selectedUsers.map((user) => user.userId)} // Chỉ truyền danh sách userId
                />
              ))}
          </div>
        </div>

        {/* Hiển thị danh sách đã chọn */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Selected Users</label>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.userId}
                className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
              >
                {/* Sử dụng Avatar component */}
                <Avatar
                  userId={user.userId}
                  fullname={user.name}
                  imageUrl={user.profile_pic}
                  width={30}
                  height={30}
                />
                {/* Hiển thị tên người dùng */}
                <span>{user.name}</span>
                {/* Nút xóa */}
                <IoClose
                  className="ml-2 cursor-pointer text-red-500"
                  onClick={() => handleUserDeselect(user.userId)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nút tạo nhóm */}
        <div className="text-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCreateGroup}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
