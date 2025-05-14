import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Clone from "../assets/images/clone.jpg";
import Logo from "../assets/images/logoiu.png";
import Logo1 from "../assets/images/LogoHCMIU.svg";
import Huyhieu from "../assets/images/huyhieu.png";
import AlumniImage1 from "../assets/images/iubg.jpg"; // Import your images
import AlumniImage2 from "../assets/images/iubg2.jpg"; // Import your images
import AlumniImage3 from "../assets/images/hoptac.png"; // Import your images
import MessagePage from '../Components/Message/MessagePage';
import ChatBox from '../Components/Message/Theme/ChatBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faQuestion, faChevronRight, faChevronLeft, faEnvelope, faBell,faCommentDots,faCrown,faCalendarDay, faClock, faLocationDot, faPhone, faLocation } from '@fortawesome/free-solid-svg-icons';

import axios from "axios";
import { faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { io } from 'socket.io-client';
import Avatar from '../Components/AluminiList/Avatar';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import EditUserDetail from './Message/Theme/EditUserDetail';
import { IndividualCard } from '../Components/Outstanding/Individual';
import AdminSidebar from './Admin/AdminSidebar';
const Search = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const ContactIcon = <FontAwesomeIcon icon={faQuestion} />;
const EmailIcon = <FontAwesomeIcon icon={faEnvelope} />;
const NotificationIcon = <FontAwesomeIcon icon={faBell} />;

interface User {
  _id: string;
  mongoId?: string;
  fullname: string;
  profile_pic?: string;
  isGroup: boolean;
}


const Page = () => {
  const user = useSelector((state: RootState) => state.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  interface Notification {
    id: number;
    message: string;
    time: string;
  }
  interface Alumni {
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    voting: number;
  }
 
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [unseenNotifications, setUnseenNotifications] = useState(0);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentNews, setRecentNews] = useState<Event[]>([]);
  const [recentOrg, setRecentOrg] = useState<Event[]>([]);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const fields = ['EFA', 'BM', 'CE', 'EE', 'IAC', 'CEE', 'IU', 'IT', 'MA', 'BD', 'IEM', 'EN', 'PH', 'BA', 'BT'];
  const fieldsPerPage = 3;
  interface Event {
    id: number;
    picture: '';
    title: string;
    time: string;
    descr: string;
    location: string;
    author:string;
    tags:string;
  }
  interface News {
    id: number;
    picture: '';
    title: string;
    time: string;
    descr: string;
    location: string;
    categogies: string;
    tags: string;
  }
  interface Org {
    id: number;
    picture: '';
    title: string;
    time: string;
    linkweb:  string;
    industry: string;
    descr: string;
    location: string;
    categogies: string;
    tags: string;
    contacter: string;
    position: string;
  }
  interface Individual {
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    
  }
  interface TopVotedAlumni {
    id: number;
    fullname: string;
    profile_pic: string;
    degree: string;
    votes: number;
  }
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [org, setOrg] = useState<Org[]>([]);
  const images = [ AlumniImage3]; // Array of images "AlumniImage1, AlumniImage2,"
  const organisationRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const individualsRef = useRef<HTMLDivElement>(null);
  const OutstandingRef = useRef<HTMLDivElement>(null);
  const [showMessagePage, setShowMessagePage] = useState(false);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [topVotedAlumni, setTopVotedAlumni] = useState<TopVotedAlumni[]>([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  // Scroll to the section when clicked
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };
  
  useEffect(() => {
    axios.get('http://localhost:3300/page', { withCredentials: true })
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(true);
          setRole(res.data.role);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 3 seconds
  
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [images.length]);
  const handleDelete = () => {
    axios.get('http://localhost:3300/logout', { withCredentials: true })
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(false);
          navigate('/');
        }
      })
      .catch((err) => console.log(err));
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  const nextFields = () => {
    setCurrentFieldIndex((prevIndex) => (prevIndex + fieldsPerPage) % fields.length);
  };

  const prevFields = () => {
    setCurrentFieldIndex((prevIndex) => (prevIndex - fieldsPerPage + fields.length) % fields.length);
  };
  useEffect(() => {
    axios.get('http://localhost:3300/api/events')
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the events!', error);
      });
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3300/api/news')
      .then(response => {
        setNews(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the news!', error);
      });
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3300/api/org')
      .then(response => {
        setOrg(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the org!', error);
      });
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3300', {
      auth: {
        token: localStorage.getItem('token') // Assuming you store the token in localStorage
      }
    });
    socket.on('recentEvents', (events) => {
      setRecentNews((prevEvents) => [events, ...prevEvents]); // Add the new news to the top of the list
    });
    socket.on('recentNews', (news) => {
      setRecentNews((prevNews) => [news, ...prevNews]); // Add the new news to the top of the list
    });
    // Listen for unseen notifications count
    socket.on('unseenNotifications', (count) => {
      setUnseenNotifications(count);
    });

    // Listen for new event notifications
    socket.on('newEvent', (event) => {
      setUnseenNotifications(prevCount => prevCount + 1);
      setNotifications(prevNotifications => {
        const newNotifications = [...prevNotifications, { id: Date.now(), message: `New event created: ${event.title}`, time: event.time }];
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        return newNotifications;
      });
    });
    socket.on('newNews', (news) => {
      setUnseenNotifications(prevCount => prevCount + 1);
      setNotifications(prevNotifications => {
        const newNotifications = [...prevNotifications, { id: Date.now(), message: `New newa created: ${news.title}`, time: news.time }];
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        return newNotifications;
      });
    });
    socket.on('newOrg', (org) => {
      setUnseenNotifications(prevCount => prevCount + 1);
      setNotifications(prevNotifications => {
        const newNotifications = [...prevNotifications, { id: Date.now(), message: `New Org created: ${org.title}`, time: org.time }];
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        return newNotifications;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3300/api/individuals')
      .then(response => setIndividuals(response.data))
      .catch(error => console.error('Error fetching individuals:', error));
  }, []);
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Fetch recent events
      axios.get('http://localhost:3300/api/events/recent')
        .then(response => {
          setRecentEvents(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the recent events!', error);
        });

      // Fetch recent news
      axios.get('http://localhost:3300/api/news/recent', { withCredentials: true })
    .then(response => {
      setRecentNews(response.data); // Set only the filtered news
    })
    .catch(error => {
      console.error('There was an error fetching the recent news!', error);
    });
      // Fetch recent org
      axios.get('http://localhost:3300/api/org/recent')
      .then(response => {
        setRecentOrg(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the recent org!', error);
      });
      setUnseenNotifications(0);
    }
};
useEffect(() => {
  

  axios.get('http://localhost:3300/api/news/recent', { withCredentials: true })
    .then(response => {
      setRecentNews(response.data); // Set only the filtered news
    })
    .catch(error => {
      console.error('There was an error fetching the recent news!', error);
    });
    
}, []);
useEffect(() => {
  

  axios.get('http://localhost:3300/api/events/recent', { withCredentials: true })
    .then(response => {
      setRecentEvents(response.data); // Set only the filtered news
    })
    .catch(error => {
      console.error('There was an error fetching the recent events!', error);
    });
    
}, []);

useEffect(() => {
  // Fetch the top 3 voted alumni
  axios.get('http://localhost:3300/api/top-voted')
    .then(response => {
      setTopVotedAlumni(response.data);
    })
    .catch(error => {
      console.error('Error fetching top-voted alumni:', error);
    });
}, []);

const toggleMessagePage = () => {
  setShowMessagePage(!showMessagePage);
};
const userId = user?.id;
const handleMessageClick = () => {
  if (userId) {
    navigate(`/message/${userId}chat`); // Navigate to the message page with userId
  } else {
    console.error('User ID is not available');
  }
};
const toggleAdminPanel = () => {
  setIsAdminPanelOpen(!isAdminPanelOpen);
};

  return (
    <>
      <div className="header bg-[#2f398e]">
        {/* Admin Panel */}
          {isAdminPanelOpen && (
            <div className="fixed inset-0 z-50 flex">
              <AdminSidebar  />
              <div
                className="flex-1 bg-black bg-opacity-50"
                onClick={toggleAdminPanel} // Close panel when clicking outside
              ></div>
            </div>
          )}

          {/* Admin Panel Toggle Button */}
          {role === 'admin' && (
            <button
              onClick={toggleAdminPanel}
              className="fixed top-6 left-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40 hover:bg-red-600"
            >
              Admin Panel
            </button>
          )}

      {/* Rest of the Page */}
      <div className="header bg-[#2f398e]">
        {/* ...existing code... */}
      </div>
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10">
          <Link to={'/'}><img src={Logo} className="w-60 md:w-70 rounded-lg" alt="logo" /></Link>
          <Link to={'/'} className="text-2xl md:text-4xl text-white font-mono font-bold hover:underline mt-2 md:mt-0">Alumni's IU Network</Link>
          <div className="header-right mt-4 md:mt-0">
            {auth ? (
              <div className="flex flex-col md:flex-row items-center">
                <h3 className='text-white font-mono'>Welcome, {role} !</h3>
                <button
            className="mx-auto pl-5"
            title={user?.fullname}
            onClick={() => setEditUserOpen(true)}
          >
            {user && (
              <>
                <Avatar
                  userId={user?.mongoId} 
                  fullname={user?.fullname || 'User'}
                  imageUrl={user?.profile_pic }
                  width={40}
                  height={40}
                />
                <p className="text-sm text-center text-gray-700 mt-1">{user?.fullname}</p>
              </>
            )}
          </button>
                <button className="align-middle select-none text-center font-mono ml-0 md:ml-10 mt-2 md:mt-0 py-2 px-4 md:py-3 md:px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10" onClick={handleDelete}>Logout</button>
                <div className="relative ml-4">
                  <FontAwesomeIcon icon={faBell} className="text-white text-2xl cursor-pointer" onClick={toggleNotifications} />
                  {unseenNotifications > 0 && (
                    <div className="absolute top-0 right-2 bg-red-500 text-white rounded-full w-2 h-4 flex items-center justify-center text-xs">
                      {unseenNotifications}
                    </div>
                  )}
                  {showNotifications && (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      <ul className="list-none p-2">
        {/* Recent Events */}
        <li className="font-bold text-gray-700 mb-2">Recent Events</li>
        {recentEvents.length > 0 ? (
  recentEvents.map((event, index) => (
    <li key={index} className="p-2 border-b border-gray-200">
      <Link to={`/events/${event.id}`}>
        <p>{event.title}</p>
        <p className="text-sm text-gray-500">{new Date(event.time).toLocaleString()}</p>
      </Link>
    </li>
  ))
) : (
  <li className="p-2 text-gray-500">No recent news available.</li>
)}
        {/* Recent News */}
<li className="font-bold text-gray-700 mt-4 mb-2">Recent News</li>
{recentNews.length > 0 ? (
  recentNews.map((news, index) => (
    <li key={index} className="p-2 border-b border-gray-200">
      <Link to={`/news/${news.id}`}>
        <p>{news.title}</p>
        <p className="text-sm text-gray-500">{new Date(news.time).toLocaleString()}</p>
      </Link>
    </li>
  ))
) : (
  <li className="p-2 text-gray-500">No recent news available.</li>
)}
        {/* Recent Organisation */}
        <li className="font-bold text-gray-700 mt-4 mb-2">Recent Organisation</li>
        {recentOrg.map((org, index) => (
          <li key={index} className="p-2 border-b border-gray-200">
            <Link to={`/org/${org.id}`}>
              <p>{org.title}</p>
              <p className="text-sm text-gray-500">{new Date(org.time).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center">
                <h3>{message}</h3>
                <Link className="align-middle select-none text-center mt-2 md:mt-0 md:ml-10 py-2 px-4 md:py-3 md:px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10" to={'/login'}>Login</Link>
                <Link to={'register'}>
                  <button className="align-middle select-none text-center mt-2 md:mt-0 md:ml-10 py-2 px-4 md:py-3 md:px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10">Register</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alumni Connect Section */}
      <section className="my-10 text-center relative">
  <button
    onClick={prevImage}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
  >
    <FontAwesomeIcon icon={faChevronLeft} />
  </button>
  <img
    src={images[currentImageIndex]}
    alt="Alumni Connect"
    className="mx-auto w-full md:w-auto"
  />
  <button
    onClick={nextImage}
    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
  >
    <FontAwesomeIcon icon={faChevronRight} />
  </button>
  <h2 className="text-2xl md:text-3xl font-mono font-bold mt-4">
    Connect with your fellow alumni today
  </h2>
  <p className="text-lg md:text-xl font-mono mt-2">
    Easy find fellow alumni by searching their name, program, or cohort.
    Reconnect and expand your professional network with just a few clicks.
  </p>
</section>

      {/* <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 border-y-2 border-indigo-200 mb-10">
        <div className="headerSearch w-full md:w-auto">
          <form className="max-w-sm mx-auto">
            <select
              value={selectedValue}
              onChange={handleSelectChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 font-mono mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>I'm looking for...</option>
              <option value="organization">Organisation</option>
              <option value="individual">Individual</option>
            </select>
          </form>
          <button className="absolute ml-2 mt-2">{Search}</button>
        </div>
      </div> */}
       {/* Navigation Links */}
       <div className="flex justify-center space-x-4 my-4">
        <button
          onClick={() => scrollToSection(organisationRef)}
          className="text-white bg-blue-500 px-4 py-2 rounded"
        >
          Organization
        </button>
        <button
          onClick={() => scrollToSection(eventsRef)}
          className="text-white bg-blue-500 px-4 py-2 rounded"
        >
          Events
        </button>
        <button
          onClick={() => scrollToSection(newsRef)}
          className="text-white bg-blue-500 px-4 py-2 rounded"
        >
          News
        </button>
        <button
          onClick={() => scrollToSection(individualsRef)}
          className="text-white bg-blue-500 px-4 py-2 rounded"
        >
          Individuals
        </button>
        <button
          onClick={() => scrollToSection(OutstandingRef)}
          className="text-white bg-blue-500 px-4 py-2 rounded"
        >
          Outstanding Individuals
        </button>
      </div>
{/* Content */}
<section className="flex flex-col md:flex-row">
        <div className="basis-full md:basis-1/2 p-4 md:pl-40">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/Zl0BwF27_qA?si=Fadxjxyi_5_YiJtJ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
        <div className="basis-full md:basis-1/2 p-4 md:pt-14 text-xl md:text-3xl font-mono bg-[#EDE8E0] text-center">
          International University Alumni Network helps you introduce your professional expertise, search for potential business partners, and expand your personal network by chatting with other members without sending a friend request.
        </div>
      </section>
      {/* <section className="mb-10">
        <div className="">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center hover:text-[#2f398e]">
            <a href="/org" className="navy-pill rounded-lg shadow-lg  p-2 font-mono font-bold hover:underline">Organisation</a>
            
            
            
          </div>
        </div>
      </section> */}
      {/* Org Section */}
{/* Organisation Section */}   
<section ref={organisationRef} className="my-10 p-4 md:p-10">
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">Organisation</h2>
  <section className="mb-10">
        <div className="">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center hover:text-[#2f398e]">
            
            <a href="/org" className="navy-pill rounded-lg shadow-lg   p-2 font-mono font-bold hover:underline">View All</a>
          </div>
        </div>
      </section>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {org.map(org => (
      <div key={org.id} className="p-4 border rounded-lg shadow-md">
        <img
          src={org.picture}
          alt={org.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="mt-4">
                      <Link to={`/org/${org.id}`}>
                                  <h3 className="text-xl font-bold hover:underline">{org.title}</h3>
                                </Link>
                      <p className="text-lg font-mono"><FontAwesomeIcon icon={faCalendarDay} />: {new Date(org.time).toLocaleDateString()}</p>
                                  <p className="text-lg font-mono"><FontAwesomeIcon icon={faClock} />: {new Date(org.time).toLocaleTimeString()}</p>
                      {/* <p className="text-lg">Description: {event.descr}</p> */}
                      <p className="text-lg font-mono"><FontAwesomeIcon icon={faLocationDot} />: {org.location}</p>
                    </div>
      </div>
    ))}
  </div>
</section>
 {/* Individuals Section */}
 {/* <section ref={individualsRef} className="my-10 p-4 md:p-10">
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">Individuals</h2>
        <section className="mb-10">
          <div className="relative">
            <button onClick={prevFields} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-20 text-center hover:text-[#2f398e]">
              {fields.slice(currentFieldIndex, currentFieldIndex + fieldsPerPage).map((field, index) => (
                <a key={index} href={`/inv/${field.toLowerCase()}`} className="navy-pill rounded-lg shadow-lg p-2 font-mono  font-bold hover:underline flex justify-between items-center">
                  {field}
                  <FontAwesomeIcon icon={faChevronRight} />
                </a>
              ))}
            </div>
            <button onClick={nextFields} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </section> */}
      {/* Voting Section */}

      <section className="my-10 p-4 md:p-10">
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">Top 3 Outstanding Alumni by Votes</h2>
  <div>
    <Link  to={'/votedata'} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">  Vote Data</Link>

  </div>
  <div className="relative grid grid-cols-3 gap-6 justify-items-center">
    {topVotedAlumni.map((alumni, index) => (
      <div
  key={alumni.id}
  className={`p-10 border-2 rounded-lg shadow-lg bg-gradient-to-r from-orange-200 via-blue-200 to-yellow-200 text-black text-center absolute  ${
    index === 0 ? 'top-0 left-1/2 transform -translate-x-1/2' : 
    index === 1 ? 'top-24 left-0' : 
    'top-24 right-0'
  }`}
  style={{
    zIndex: index === 0 ? 3 : index === 1 ? 2 : 1,
    width: '400px',
    color: 'black',
  }}
  
>
  <FontAwesomeIcon
    icon={faCrown}
    className={`text-yellow-500 mb-4 ${
      index === 0 ? 'text-6xl' : index === 1 ? 'text-5xl' : 'text-4xl'
    }`}
  />
  <img
    src={alumni.profile_pic || Clone}
    alt={alumni.fullname}
    className="w-32 h-32 object-cover rounded-full mx-auto mb-6"
  />
  <h3 className="text-2xl font-bold">
  <Link to={`/member/${alumni.id}`} className="hover:underline">
    {alumni.fullname}
  </Link>
</h3>
  <p className="text-xl font-mono ">Degree: <b className='text-blue-600'>{alumni.degree}</b></p>
  <p className="text-xl font-mono">Votes:<b className='text-red-600'> {alumni.votes}</b></p>
  <p className="text-xl font-mono font-semibold">
    {index === 0 ? 'Top 1' : index === 1 ? 'Top 2' : 'Top 3'}
  </p>
</div>
    ))}
  </div>
</section>
      <section ref={individualsRef} className="my-10 p-4 md:p-10" style={{ marginTop: '500px' }} >
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">Individuals</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Text Column */}
    <div className="flex flex-col justify-center items-start p-4">
      <h3 className="text-xl md:text-2xl font-mono font-bold mb-4">Connect with Alumni</h3>
      <p className="text-lg md:text-xl font-mono mb-6">
        Discover and connect with alumni from various fields. Expand your network and explore opportunities by finding alumni who share your interests and expertise.
      </p>
      <button
        onClick={() => navigate('/inv/it')}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
      >
        Find Alumni
      </button>
    </div>

    {/* Images Column */}
    <div className="flex justify-center items-center">
      <img
        src="https://xpertlab.com/wp-content/uploads/2024/10/depositphotos_406715246-stock-illustration-flat-illustration-group-people-teamwork.webp"
        alt="Alumni"
        className="w-full h-auto rounded-lg "
        style={{ maxHeight: '300px', width: '50%' }}
      />
    </div>
  </div>
</section>

       {/* Outstanding individuals Section */}
<section
  ref={OutstandingRef}
  className="relative my-10 p-4 md:p-10 bg-gradient-to-r from-blue-300 via-purple-200 to-pink-200 text-white overflow-hidden"

>{/* Crown Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <FontAwesomeIcon 
          icon={faCrown}
            key={i}
            className="absolute transform -rotate-12"
            style={{
              color: "#ffff00",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 2 + 1}rem`,
            }}
          />
        ))}
      </div>
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">
    Outstanding Individuals
  </h2>
  <div className="relative h-[600px] w-full overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="carousel-container">
        <div className="carousel-track">
          {individuals.map((individual, index) => {
            const angle = (index * 360) / individuals.length;
            return (
              <div
                key={individual.id}
                className="carousel-item"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(400px)`,
                }}
              >
                <IndividualCard individual={individual} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Events Section */}
<section ref={eventsRef} className="my-10 p-4 md:p-10">
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">Events</h2>
  <section className="mb-10">
        <div className="">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center hover:text-[#2f398e]">
            
            <a href="/event" className="navy-pill rounded-lg shadow-lg   p-2 font-mono font-bold hover:underline">View All</a>
          </div>
        </div>
      </section>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {events.map(event => (
      <div key={event.id} className="p-4 border rounded-lg shadow-md">
        <img
          src={event.picture}
          alt={event.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="mt-4">
        <Link to={`/event/${event.id}`}>
            <h3 className="text-xl font-bold hover:underline">{event.title}</h3>
          </Link>
          <p className="text-lg font-mono"><FontAwesomeIcon icon={faCalendarDay} />: {new Date(event.time).toLocaleDateString()}</p>
                                    <p className="text-lg font-mono"><FontAwesomeIcon icon={faClock} />: {new Date(event.time).toLocaleTimeString()}</p>
                        {/* <p className="text-lg">Description: {event.descr}</p> */}
                        <p className="text-lg font-mono"><FontAwesomeIcon icon={faLocationDot} />: {event.location}</p>
        </div>
      </div>
    ))}
  </div>
</section>
{/* News Section */}
<section ref={newsRef} className="my-10 p-4 md:p-10">
  <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-6">News</h2>
  <section className="mb-10">
        <div className="">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center hover:text-[#2f398e]">
            
            <a href="/news" className="navy-pill rounded-lg shadow-lg   p-2 font-mono font-bold hover:underline">View All</a>
          </div>
        </div>
      </section>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {news.map(news => (
      <div key={news.id} className="p-4 border rounded-lg shadow-md">
        <img
          src={news.picture}
          alt={news.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="mt-4">
        <Link to={`/news/${news.id}`}>
            <h3 className="text-xl font-bold hover:underline">{news.title}</h3>
          </Link>
          <p className="text-lg font-mono"><FontAwesomeIcon icon={faCalendarDay} />: {new Date(news.time).toLocaleDateString()}</p>
                                    <p className="text-lg font-mono"><FontAwesomeIcon icon={faClock} />: {new Date(news.time).toLocaleTimeString()}</p>
                        {/* <p className="text-lg">Description: {event.descr}</p> */}
                        <p className="text-lg font-mono"><FontAwesomeIcon icon={faLocationDot} />: {news.location}</p>
        </div>
      </div>
    ))}
  </div>
</section>
 
     {/* Contact Section */}
<section className="my-10 p-4 md:p-10 ">
  <div className="flex flex-col md:flex-row justify-between items-start ">
    {/* Left Footer Content */}
    <div className="bg-[#EDE8E0] p-6 rounded-lg shadow-md w-full md:w-1/2">
      <h3 className="text-xl font-bold mb-4 text-center">What is your queries?</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const name = (target.elements.namedItem('name') as HTMLInputElement).value;
          const email = (target.elements.namedItem('email') as HTMLInputElement).value;
          const message = (target.elements.namedItem('message') as HTMLTextAreaElement).value;

          try {
            const response = await fetch('http://localhost:3300/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, message }),
            });

            if (response.ok) {
              alert('Message sent successfully!');
              target.reset();
            } else {
              alert('Failed to send message. Please try again.');
            }
          } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred. Please try again.');
          }
        }}
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>

    {/* Right Footer Content */}
    <div className="flex  flex-col items-start mt-6 md:mt-0 md:ml-10">
      <h2 className="text-2xl md:text-3xl font-mono font-bold mb-4 m-12 text-blue-800">STAY STRONG, ACHIEVE YOUR DREAMS</h2>
      <div className="flex space-x-4">
  <Link to={'/'}>
    <img src={Logo1} className="w-80 p-6  rounded-lg" alt="logo" />
  </Link>
  <Link to={'/'}>
    <img src={Huyhieu} className="w-60 m-8 rounded-lg" alt="logo" />
  </Link>
</div>
    </div>
  </div>
</section>

      {/* Footer */}
      <div className="footer bg-[#8ed2ed]">
        <div className="border-t-2 border-solid">
          <div className="flex flex-col md:flex-row items-center justify-between font-mono p-4 md:p-10">
              
            <Link to={'/'}><img src={Logo} className="w-100 rounded-lg" alt="logo" /></Link>
            {/* <Link to={'contact'} className="mt-4 md:mt-0">Question {ContactIcon}</Link> */}
            {/* Contact Section */}
            <Link to={'/'}><img src={Logo1} className="w-20 rounded-lg" alt="logo" /></Link>
            {/* <Link to={'contact'} className="mt-4 md:mt-0">Question {ContactIcon}</Link> */}
            {/* Contact Section */}
           <section className="my-10 p-4 md:p-10 bg-[#EDE8E0] rounded -lg shadow-md">
                <div className="text-center">
                  <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
                    <h2 className="text-2xl md:text-3xl font-mono font-bold">Contact Us:</h2>
                    <p className="text-lg md:text-xl font-mono mt-2">Mon-Fri | 9AM-5PM</p>
                    <p className="text-lg md:text-xl font-mono mt-2">IU Viet Nam</p>
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
                  <div className="text-left">
                      
                      <p className="text-lg md:text-xl font-mono"><FontAwesomeIcon icon={faLocationDot} />      Phòng O1.111 (tòa nhà A1)</p>
                      <p className="text-lg md:text-xl font-mono">
                        <FontAwesomeIcon icon={faEnvelope} /> hoisinhvien@iuyouth.edu.vn
                      </p>
                      <p className="text-lg md:text-xl font-mono"><FontAwesomeIcon icon={faPhone} />  (028) 3724 4270 – máy lẻ: 3240</p>
                      <p className="text-lg md:text-xl font-mono"><FontAwesomeIcon icon={faInstagram} />      the_treasure_of_birdies</p>
                      <p className="text-lg md:text-xl font-mono"><FontAwesomeIcon icon={faYoutube} />   Union of Students IU</p>
                    </div>
                </div>
          </section>
          
          </div>
         
        </div>
         {editUserOpen && (
                <EditUserDetail onClose={() => setEditUserOpen(false)} user={user} />
              )}
              
      </div>
      
      {/* Floating Message Button */}
      <button
        onClick={toggleMessagePage}
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 z-50"
        title="Messages"
      >
        <FontAwesomeIcon icon={faCommentDots} size="2x" />
      </button>

      {/* Message Page Modal */}
      {showMessagePage && (
        <div className="fixed bottom-20 right-6 bg-white w-72 h-[40rem] rounded-lg shadow-lg overflow-hidden z-45">
          <div className="bg-white w-11/12 h-[28rem] md:w-72 md:h-[40rem] rounded-lg shadow-lg overflow-hidden relative">
            {/* Close Button */}
            <button
              onClick={toggleMessagePage}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            {/* MessagePage Component */}
            <MessagePage />
          </div>
        </div>
      )}
    </>
  );
}

export default Page;