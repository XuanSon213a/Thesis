import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@images/logoiu.png';
import Logo from '@images/logoiu.png';
import Logo1 from '@images/LogoHCMIU.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot, faPhone, faQuestion } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import alumnisData from '../../../backend/db.json';
import Clone from '../../assets/images/clone.jpg';
import { Alumni } from "../../types/Alumni";
import Import from './Import';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AdminSidebar from '../Admin/AdminSidebar'; // Import the AdminSidebar component
import { faLinkedin, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const ContactIcon = <FontAwesomeIcon icon={faQuestion} />;

const categories = [
  { value: 'all', label: 'All Groups' },
  { value: 'ITITIU12', label: 'ITITIU12' },
  { value: 'ITITIU11', label: 'ITITIU11' },
  { value: 'ITITIU10', label: 'ITITIU10' },
  { value: 'ITIU', label: 'ITIU (e.g., ITIU09057)' },
  { value: 'IT', label: 'IT (e.g., IT070144)' },
  { value: 'ITCSIU', label: 'ITCSIU (e.g., ITCSIU11004)' },
  { value: 'ITITUN', label: 'ITITUN (e.g., ITITUN10193)' },
  { value: 'ITSB', label: 'ITSB (e.g., ITSB09212)' },
  { value: 'ITCERG', label: 'ITCERG (e.g., ITCERG12001)' },
  { value: 'CEITIU12', label: 'CEITIU12' },
  { value: 'CEITIU11', label: 'CEITIU11' },
  { value: 'CEITIU10', label: 'CEITIU10' },
  { value: 'BABM', label: 'BABM (e.g., BABMIU12035)' },
  { value: 'BAFAIU', label: 'BAFAIU (e.g., BAFAIU12027)' },
  { value: 'BTBEIU', label: 'BTBEIU (e.g., BTBEIU11001)' },
  { value: 'PHPHIU', label: 'PHPHIU (e.g., PHPHIU12056)' },
  { value: 'EFITIU', label: 'EFITIU (e.g., EFITIU11023)' },
  { value: 'IAIAIU', label: 'IAIAIU (e.g., IAIAIU12006)' },
];

const Individuals: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all'); // State for selected group
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const userId = user?.id;
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get('http://localhost:3300/page', { withCredentials: true })
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(true);
          setName(res.data.name);
          setRole(res.data.role);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = () => {
    axios
      .get('http://localhost:3300/logout', { withCredentials: true })
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(false);
          navigate('/');
        }
      })
      .catch((err) => console.log(err));
  };

  const combinedAlumnis: Alumni[] = [
    ...(alumnisData.successData || []),
    ...(alumnisData.failureData || [])
  ];

  // Filter by search term
  const filteredBySearch = combinedAlumnis.filter((alumni) =>
    alumni.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by selected group
  const filteredAlumnis = filteredBySearch.filter((alumni) => {
    if (selectedGroup === 'all') {
      return true; // Show all alumni
    } else {
      // Filter by the selected group prefix
      return alumni["Student ID"].startsWith(selectedGroup);
    }
  });
  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(!isAdminPanelOpen);
  };
  return (
    <div className="flex">
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
          )}{/* Conditionally render the sidebar */}
      <div className="flex-1">
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
                    className="align-middle select-none text-center font-mono ml-10 py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10"
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
          <div className="flex justify-left mb-6">
            <input
              type="text"
              placeholder="Search by name..."
              className="p-2 rounded border border-gray-300 w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Group Filter Dropdown */}
          <div className="flex justify-left mb-6">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="p-2 rounded border border-gray-300"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <p className="text-center mb-6 text-gray-600">
            The individual is the member directory. It allows alumni members to
            search, view, and connect with each other on an individual basis...
          </p>

          {/* Conditionally render upload section if admin */}
          {role === 'admin' && (
            <div className="upload-section bg-white p-4 rounded-lg shadow mb-6 ">
              <Import />
            </div>
          )}

          {/* Alumnis Grid */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredAlumnis.map((member, index) => (
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
                    to={`/message/${member["Student ID"]}`}
                    className="text-right text-blue-600 font-semibold mb-2"
                  >
                    Message with Alumni
                  </Link>
                  <br />
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
        </div>


      </div>
    </div>
  );
};

export default Individuals;