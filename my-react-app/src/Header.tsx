import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faBars } from '@fortawesome/free-solid-svg-icons'

const BIcon = <FontAwesomeIcon icon={faBars} />;

import { useState } from 'react'
const Header = ()=>{

  const Links =[
    { name: "Page"},
    { name: "Page"},
    { name: "Page"},
    
  ]
  
  let[open,setOpen] = useState(false);
  return(
    <nav >
    <div className="  flex text-[20px] items-center justify-between p-20 font-bold">
        <h3 >Site name</h3>
        <a className='z-20 fixed right-5 top-6 cursor-pointer md:hidden 'onClick={()=>setOpen(!open)}>{BIcon}</a>
      <ul className ={`backdrop-blur-lg md:pl-10 pr-0  z-10  md:static fixed top-10   md:h-auto h-screen ${!open ? 'right-[-100%]':'right-0'}`}>
      {
        Links.map((link,index)=>(

       
          <li className='md:inline-block md:ml-10 ml-5 border-b-2 border-transparent hover:border-grey duration-300 md:my-0 my-6'>
             <a className='text-[20px]  md:py-5 py-3 inline-block mr-2' href="page"> {link.name}</a>
          
          </li>
       

        ))
      }
        <a> <button className="align-middle select-none text-center ml-10  py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10 ">Button</button> </a> 
      </ul>
      
    </div>
    
    </nav>
  );
}

export default Header;