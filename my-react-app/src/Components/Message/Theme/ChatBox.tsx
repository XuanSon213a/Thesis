import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import Avatar from '../../AluminiList/Avatar';
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft,FaImage,FaPlus, FaVideo } from "react-icons/fa6";
import uploadFile from '../../../helps/uploadFile';
import { IoClose } from 'react-icons/io5';
import Loading from './Loading';
import moment from 'moment';
import bg from'../../../assets/images/bg.png';
import { IoMdSend } from 'react-icons/io';
import { ObjectId } from 'mongodb';
import CreateGroup from './CreateGroup';
import toast from 'react-hot-toast';
interface User {
  id: string;
  mongoId: string;
  fullname: string;
  email: string;
  profile_pic: string;
  online: boolean;
}

interface Message {
  
  text: string;
  imageUrl: string;
  videoUrl: string;
  msgByUserId?: {
    _id: string; // ID của người gửi
    fullname: string; // Tên đầy đủ của người gửi
    profile_pic: string; // Ảnh đại diện
  } ;
  createdAt?: string;
}
interface GroupMember {
  _id: string;
  
  fullname: string;
  email: string;
  profile_pic: string;
  online: boolean; 
}

interface GroupDetails {
  id: string; // ID của nhóm
  fullname: string; // Tên nhóm
  description?: string; // Mô tả nhóm (tùy chọn)
  members: GroupMember[]; // Danh sách thành viên trong nhóm
}
const ChatBox: React.FC  = () =>{
  const location = useLocation();
  const [group, setGroup] = useState<any>(location.state?.group || null); // Lấy thông tin nhóm từ `navigate`
  const isGroupChat = location.pathname.includes("/group") || group !== null;
  const user = useSelector((state: RootState) => state.user); 
  const params = useParams();
  const socketConnection = useSelector((state: RootState) => state?.user?.socketConnection);
  

  console.log("params:", params.id);
  console.log("location.pathname:", location.pathname);
  console.log("group:", group);
  console.log("isGroupChat:", isGroupChat);
  

  
  const [dataUser,setDataUser] = useState({
    fullname : "",
    email : "",
    profile_pic : "",
    online : false,
    mongoId : "",
    id:""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);

  const [message, setMessage] = useState<Message>({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState<Message[]>([]);
  const currentMessage = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(currentMessage.current){
        currentMessage.current.scrollIntoView({behavior : 'smooth', block : 'end'})
    }
      },[allMessage])

  const handleUploadImageVideoOpen =() =>{
    setOpenImageVideoUpload(prev => !prev);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage(prev => ({
      ...prev,
      imageUrl: uploadPhoto.url
    }));
  };
  const handleClearUploadImage = () => {
    setMessage(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage(prev => ({
      ...prev,
      videoUrl: uploadPhoto.url
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage(prev => ({
      ...prev,
      videoUrl: ""
    }));
  };


  useEffect(() => {
    
    if(socketConnection){
      socketConnection.emit('message-page',params.id,isGroupChat)

      socketConnection.emit('seen',params.id);
      
      // Lấy thông tin người dùng hoặc nhóm
    if (isGroupChat) {
      socketConnection.on('group-details', (groupDetails: GroupDetails) => {
        setGroup(groupDetails);
        console.log("Group Details After Reload:", groupDetails);
      });
    } else {
      socketConnection.on('message-user', (data: User) => {
        setDataUser(data);
      });
    }

      socketConnection.on('message', (data: Message[]|any) => {
        if (Array.isArray(data)) {
          setAllMessage(data);
        } else if (data?.message) {
          // Nếu dữ liệu là một tin nhắn đơn lẻ, thêm vào danh sách
          setAllMessage((prev) => [...prev, data.message]);
        } else {
          console.error("Invalid message data format:", data);
        }
      });
      
    }// Cleanup
  return () => {
    if (socketConnection) {
      socketConnection.off('message-user');
      socketConnection.off('group-details');
      socketConnection.off('message');
    }
  };
},[socketConnection,params?.id,user,isGroupChat]);
useEffect(() => {
  if (!group && isGroupChat && socketConnection && params.id) {
    console.log("Fetching group details from server for:", params.id);
    socketConnection.emit("fetch-group-details", params.id, (groupDetails: GroupDetails) => {
      if (groupDetails) {
        setGroup(groupDetails);
        console.log("Fetched group details:", groupDetails);
      }
    });
  }
}, [socketConnection, params.id, isGroupChat]);

const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  setMessage(prev => ({
    ...prev,
    text: value
  }));
};


const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();

  if (message.text || message.imageUrl || message.videoUrl) {
    if (socketConnection) {
      socketConnection.emit('new message', {
        sender: user?.mongoId,
        receiver: isGroupChat ? undefined : params.id,
        groupId: isGroupChat ? params.id : undefined,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: user?.mongoId,
        isGroup: isGroupChat,
      });

      // // Gửi tin nhắn qua socket và đợi phản hồi
      // socketConnection.emit("new message", newMessage, (response: { success: boolean; message?: Message }) => {
      //   if (response?.success && response?.message) {
      //     // Chỉ cập nhật khi nhận được phản hồi từ server
      //     setAllMessage((prev) => [...prev, response.message].filter((msg): msg is Message => !!msg));
      //   } else {
      //     toast.error("Failed to send message. Please try again.");
      //     console.error("Error sending message:", response);
      //   }
      // });

      // Xóa nội dung tin nhắn sau khi gửi
      setMessage({
        text: "",
        imageUrl: "",
        videoUrl: "",
      });
    } else {
      console.error("Socket connection is not available.");
    }
  }
};


useEffect(() => {
  if (!group && socketConnection && params.id) {
    console.log("Fetching group details from server for:", params.id);
    socketConnection.emit("fetch-group-details", params.id, (groupDetails: any) => {
      if (groupDetails) {
        setGroup(groupDetails);
        console.log("Fetched group details:", groupDetails);
      }
    });
  }
}, [group, socketConnection, params.id]);

  return (
    <div style={{ backgroundImage: `url(${bg})` }} className='bg-no-repeat bg-cover'>
          <header className='sticky top-0 h-20 bg-white flex justify-between items-center px-4'>
                  <div className='flex items-center gap-4'>
                      <Link to={"/message/:id"} className='lg:hidden'>
                          <FaAngleLeft size={25}/>
                      </Link>
                      <div className='pt-2'>
  <Avatar
    width={50}
    height={50}
    imageUrl={isGroupChat ? group.profile_pic : dataUser?.profile_pic}
    fullname={isGroupChat ? group.name : dataUser?.fullname}
    userId={isGroupChat ? group._id : dataUser?.id}
  />
</div>
<div>
  <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>
    {isGroupChat ? group.name : dataUser?.fullname}
  </h3>
  {isGroupChat ? (
    <div className="flex gap-2 ">
      {group?.members?.map((member: GroupMember) => (
        <Avatar
          key={member._id}
          userId={member._id}
          fullname={member.fullname}
          imageUrl={member.profile_pic}
          width={40}
          height={40}
        />
      ))}
    </div>
  ) : (
    <p className='-my-2 text-sm'>
      {dataUser.online ? (
        <span className='text-primary'>online</span>
      ) : (
        <span className='text-slate-400'>offline</span>
      )}
    </p>
  )}
</div>

                  <div >
                    <button  className='cursor-pointer hover:text-primary'>
                      <HiDotsVertical/>
                    </button>
                    
                        </div>
                      </div>
          </header>
          {/* Show chatting */}
          <section className='h-[calc(100vh-128px)] overflow-y-scroll bg-slate-200 bg-opacity-50'>
            <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
            {Array.isArray(allMessage) && allMessage.length > 0 ? (
    allMessage.map((msg, index) => (
      <div
        key={index}
        className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
          isGroupChat
        ? user.mongoId?.toString() === msg?.msgByUserId?._id?.toString()
          ? "ml-auto bg-teal-100"
          : "bg-white"
        : user.mongoId?.toString() === msg?.msgByUserId?.toString()
          ? "ml-auto bg-teal-100"
          : "bg-white"
        }`}
      >
        {isGroupChat && (
            <p className="text-xs font-semibold mb-1">
              {typeof msg?.msgByUserId === 'object'
                ? msg?.msgByUserId?.fullname || "Unknown User"
                : "Unknown User"}
            </p>
          )}
        <div className="w-full relative">
          {msg?.imageUrl && (
            <img src={msg?.imageUrl} className="w-full h-full object-scale-down" />
          )}
          {msg?.videoUrl && (
            <video src={msg.videoUrl} className="w-full h-full object-scale-down" controls />
          )}
        </div>
        <p className="px-2">{msg.text}</p>
        <p className="text-xs ml-auto w-fit">{moment(msg.createdAt).format("hh:mm")}</p>
      </div>
    ))
  ) : (
    <p className="text-center text-slate-500">No messages yet</p>
  )}

            </div>  
          {/* Upload Preview */}
          {
                    message.imageUrl && (
                      <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
                        <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
                            <IoClose size={30}/>
                        </div>
                        <div className='bg-white p-3'>
                            <img
                              src={message.imageUrl}
                              alt='uploadImage'
                              className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                            />
                        </div>
                      </div>
                    )
                  }
              {
                    message.videoUrl && (
                      <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
                        <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
                            <IoClose size={30}/>
                        </div>
                        <div className='bg-white p-3'>
                            <video 
                              src={message.videoUrl} 
                              className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                              controls
                              muted
                              autoPlay
                            />
                        </div>
                      </div>
                    )
                  }

                  {
                    loading && (
                      <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
                        <Loading/>
                      </div>
                    )
                  }
        
          </section>
          {/* send message */}
          <section className='h-16 bg-white flex items-center px-4'>
            <div className='relative '>
              <button onClick={handleUploadImageVideoOpen}  className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-slate-200 hover:text-blue-800'>
                  <FaPlus size={20} />
              </button>
              {/* Show video and image*/}
              {
                openImageVideoUpload &&(
                  <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                              <div className='text-blue-500'>
                                  <FaImage size={18}/>
                              </div>
                              <p>Image</p>
                </label>
                <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                              <div className='text-purple-500'>
                                  <FaVideo size={18}/>
                              </div>
                  <p>Video</p>
                </label>
                <input type="file" id="uploadImage" onChange={handleUploadImage} className='hidden' />
                <input type="file" id="uploadVideo" onChange={handleUploadVideo} className='hidden' />
              </div>
                )
              }
              
            </div>
            {/**input box */}
            <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
                  <input
                    type='text'
                    placeholder='Type here message...'
                    className='py-1 px-4 outline-none w-full h-full'
                    value={message.text}
                    onChange={handleOnChange}
                  />
                  <button className='text-primary hover:text-secondary'>
                      <IoMdSend size={28}/>
                  </button>
              </form>
          </section>
    </div>
  );
};

export default ChatBox;
