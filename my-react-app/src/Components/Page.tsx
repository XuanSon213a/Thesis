import React ,{useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Logo from "../assets/images/logoiu.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import { faQuestion } from '@fortawesome/free-solid-svg-icons'

import axios from "axios";
// import Admin from '../Admin';
// import Clone from '../Clone';

const Search = <FontAwesomeIcon icon={faMagnifyingGlass} />;

const Contact = <FontAwesomeIcon icon={faQuestion} />



const Page =() => {
  const [selectedValue, setSelectedValue] = useState('');
  const [auth,setAuth]= useState(false);
  const [message,setMessage]= useState('')
  const [role,setRole]= useState('')
  axios.defaults.withCredentials=true;
  const navigate = useNavigate();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value); // Update state on select change
  };

  useEffect(() => {
    axios.get('http://localhost:3300/page', { withCredentials: true }) // Make sure the port is correct
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

const handleDelete = () => {
  axios.get('http://localhost:3300/logout', { withCredentials: true }) // Use the correct API route
    .then((res) => {
      if (res.data.Status === 'Success') {
        setAuth(false); // Update state to reflect logged-out status
        navigate('/'); // Redirect to the login page
      }
    })
    .catch((err) => console.log(err));
};
  return (
    <>
    
    <div className="header bg-[#2f398e]">
      
  
      <div className="flex items-center justify-between p-10">
      <Link to={'/'} ><img src={Logo} className="w-70  rounded-lg " alt="logo" /></Link>
      <Link to={'/'} className="text-4xl text-white font-mono font-bold hover:underline"  >Alumni's IU Network</Link>
        <div className="header-right">
          {
          auth?
          <div>
            <h3 className='text-white font-mono'>Welcome, {role} !</h3>
            
            <button className="align-middle select-none text-center font-mono ml-10  py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10 " onClick={handleDelete} >Logout</button>
          </div>
        :
          <div>
              <h3>{message}</h3>
              <Link className="align-middle select-none text-center ml-10  py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10 " to={'/login'} >Login</Link>
              <Link to={'register'} >
               <button className="align-middle select-none text-center ml-10  py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10 ">Register</button>  </Link>
          
          </div>
          }

        </div>
      </div>

    </div>
   
    <div className="flex">
        <p className="grow pt-10 pb-10 text-center text-2xl text-black font-mono font-bold ">What are you looking for?</p>
    </div>
    <div className="flex items-center justify-between p-10 border-y-2 border-indigo-200 mb-10">
      
     
    <div className="headerSearch">
        <form className="max-w-sm mx-auto">
          <select
            value={selectedValue} // Use value prop to control select
            onChange={handleSelectChange} // Handle change event
            className="bg-gray-50 border border-gray-300 text-gray-900 font-mono mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" disabled>
              I'm looking for...
            </option>
            <option value="organization">Organisation</option>
            <option value="individual">Individual</option>
          </select>
        </form>
        <button className="position: absolute ml-5 mt-2"> {Search}</button>
      </div>
      
      
    </div>
    <section className="mb-10 ">
            <div className="">
                  <div className="grid grid-cols-4 gap-4 text-center hover:text-[#2f398e]  ">
                      <a href="/org" className="navy-pill rounded-lg shadow-lg shadow-blue-500/50 p-2 font-mono font-bold hover:underline ">Organisation</a>
                      <a href="/inv" className="navy-pill rounded-lg shadow-lg shadow-blue-500/50 p-2 font-mono font-bold hover:underline ">Individual</a>
                      <a href="/news" className="navy-pill rounded-lg shadow-lg shadow-blue-500/50 p-2 font-mono font-bold hover:underline ">News</a>
                      <a href="/event" className="navy-pill rounded-lg shadow-lg shadow-blue-500/50 p-2 font-mono font-bold hover:underline ">Events</a>
                  </div>
            </div>
    </section>
 {/* content */}
    <section className="flex flex-row ">
        <div className="basis-1/2 pl-40"><iframe width="560" height="315" src="https://www.youtube.com/embed/Zl0BwF27_qA?si=Fadxjxyi_5_YiJtJ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div>
        <div className="basis-1/2 pt-14 text-3xl font-mono bg-[#EDE8E0] text-center ">International University Alumni Network helps you introduce your professional expertise, search for potential business partners, and expand your personal network by chatting with other members without sending a friend request.</div>

    </section>
  {/* Footer */}
  <div className="footer bg-[#2f398e]">
      <div className="border-t-2 border-solid">
          <div className="flex items-center justify-between font-mono p-10">
            <Link to={'/'} ><img src={Logo} className="w-40  rounded-lg " alt="logo" /></Link>
            <Link to={'contact'} >Contact {Contact}</Link>
          </div>
          
      </div>
  </div>
    </>
  );
}
export default Page;