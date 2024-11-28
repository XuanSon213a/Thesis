import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Avatar from '../../AluminiList/Avatar';
import { useDispatch } from 'react-redux';
import uploadFile from '../../../helps/uploadFile';
import Divider from '../../Message/Theme/Divider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setUser } from '../../../redux/userSlice';

interface User {
  fullname?: string;
  profile_pic?: string;
}

interface EditUserDetailsProps {
  onClose: () => void;
  user: User | null;
}

const EditUserDetails: React.FC<EditUserDetailsProps> = ({ onClose, user }) => {
  const [data, setData] = useState<User>({
    fullname: user?.fullname || '', // Default to an empty string if undefined
    profile_pic: user?.profile_pic || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const uploadPhotoRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setData({
        fullname: user.fullname || '',
        profile_pic: user.profile_pic || '',
      });
    }
  }, [user]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenUploadPhoto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    uploadPhotoRef.current?.click();
  };

  const handleUploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploadPhoto = await uploadFile(file);
        setData((prev) => ({
          ...prev,
          profile_pic: uploadPhoto?.url || '',
        }));
        toast.success('Photo uploaded successfully.');
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Failed to upload photo.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    
    try {
      console.log('Payload:', data); // Log dữ liệu gửi đi
      const URL = 'http://localhost:3300/update-user';
    
      const response = await axios.post(URL, data, {
        withCredentials: true,
      });
    
      console.log('Response:', response.data); // Log phản hồi từ server
      toast.success(response.data.message || 'Profile updated successfully.');
      dispatch(setUser(response.data.user));
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error Response:', error.response?.data);
        toast.error(error.response?.data?.Error || 'Failed to update profile.');
      } else {
        console.error('Unexpected Error:', error);
        toast.error('An unexpected error occurred.');
      }
    }
    
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm">
        <h2 className="font-semibold">Profile Details</h2>
        <p className="text-sm">Edit user details</p>

        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="fullname">Name:</label>
            <input
                type="text"
                name="fullname"
                id="fullname"
                value={data.fullname || ''} // Fallback to empty string
                onChange={handleOnChange}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />
          </div>

          <div>
            <div>Photo:</div>
            <div className="my-1 flex items-center gap-4">
              <Avatar width={40} height={40} imageUrl={data.profile_pic || ''} fullname={data.fullname || ''} userId="" />
              <button className="font-semibold" onClick={handleOpenUploadPhoto}>
                Change Photo
              </button>
              <input
                type="file"
                className="hidden"
                onChange={handleUploadPhoto}
                ref={uploadPhotoRef}
              />
            </div>
          </div>

          <Divider />
          <div className="flex gap-2 w-fit ml-auto">
            <button
              onClick={onClose}
              className="border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary ${isLoading && 'opacity-50 cursor-not-allowed'}`}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
