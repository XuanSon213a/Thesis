import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
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
interface User {
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
  msgByUserId?: string;
  createdAt?: string;
}
const ChatBox: React.FC  = () =>{
  
  const user = useSelector((state: RootState) => state.user); 
  const params = useParams();
  const socketConnection = useSelector((state: RootState) => state?.user?.socketConnection);
  console.log('params',params.id);
  

  
  const [dataUser,setDataUser] = useState({
    fullname : "",
    email : "",
    profile_pic : "",
    online : false,
    mongoId : ""
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
      socketConnection.emit('message-page',params.id)

      socketConnection.emit('seen',params.id)

      socketConnection.on('message-user',(data: User)=>{
        setDataUser(data)
      })

      socketConnection.on('message', (data: Message[]) => {
        console.log('message data',data)
        setAllMessage(data);
      });
    }
},[socketConnection,params?.id,user]);

const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  setMessage(prev => ({
    ...prev,
    text: value
  }));
};


const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Sender user ID:', user);
  if (message.text || message.imageUrl || message.videoUrl) {
    if (socketConnection) {
      socketConnection.emit('new message', {
        sender: user?.mongoId,
        receiver: params.id,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: user?.mongoId
      })
      console.log('user?._id',user);
      setMessage({
        text: "",
        imageUrl: "",
        videoUrl: ""
      });
    }
  }
};

  return (
    <div style={{ backgroundImage: `url(${bg})` }} className='bg-no-repeat bg-cover'>
          <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
                  <div className='flex items-center gap-4'>
                      <Link to={"/message/:id"} className='lg:hidden'>
                          <FaAngleLeft size={25}/>
                      </Link>
                    <div className='pt-2'>
                    <Avatar
                        width={50}
                        height={50}
                        imageUrl={dataUser?.profile_pic}
                        fullname={dataUser?.fullname}
                        userId={dataUser?.mongoId}
                      />
                    </div>
                    <div>
                     <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.fullname}</h3>
                     <p className='-my-2 text-sm'>
                      {
                        dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>
                      }
                     </p>
                  </div>
                  <div >
                    <button className='cursor-pointer hover:text-primary'>
                      <HiDotsVertical/>
                    </button>
              </div>
                  </div>
          </header>
          {/* Show chatting */}
          <section className='h-[calc(100vh-128px)] overflow-y-scroll bg-slate-200 bg-opacity-50'>
            <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
            {
                      allMessage.map((msg,index)=>{
                        return(
                          <div className={` p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user.mongoId === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}>
                            <div className='w-full relative'>
                              {
                                msg?.imageUrl && (
                                  <img 
                                    src={msg?.imageUrl}
                                    className='w-full h-full object-scale-down'
                                  />
                                )
                              }
                              {
                                msg?.videoUrl && (
                                  <video
                                    src={msg.videoUrl}
                                    className='w-full h-full object-scale-down'
                                    controls
                                  />
                                )
                              }
                            </div>
                            <p className='px-2'>{msg.text}</p>
                            <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                          </div>
                        )
                      })
                    }
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
