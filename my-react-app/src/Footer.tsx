import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
const fbIcon = <FontAwesomeIcon icon={faFacebook} />;
const linkIcon =<FontAwesomeIcon icon={faLinkedin} />
const ytbIcon = <FontAwesomeIcon icon={faYoutube} />
const igIcon = <FontAwesomeIcon icon={faInstagram} />
function Footer (){
  return(
  <section >
    <div className=" grid grid-cols-6  items-center justify-between m-16 border-t-2 border-solid   ">
      <h3 className = "col-start-1 col-end-3 text-[25px] pt-12 ">Site name</h3>
      <div className='grid grid-cols-8 col-start-1 col-end-3 m-2 pt-20 text-[#828282]  '>
          <a >{fbIcon}</a>
          <a>{linkIcon}</a>
          <a>{ytbIcon}</a>
          <a>{igIcon}</a>
      </div>
    
    
    <div className=" grid grid-rows-4  gap-0 col-start-4 col-end-5 -mt-10 text-[18px]   ">
      
      <a>Topic</a> <br></br>
      <a className='text-[#454545]'>Page</a>
      <br></br>
      <a className='text-[#454545]' >Page</a><br></br>
      <a className='text-[#454545]'>Page</a>
    
    </div>
    <div className="grid grid-rows-4 gap-0 col-start-5 col-end-6 -mt-10 text-[18px] ">
      
      <a>Topic</a> <br></br>
      <a className='text-[#454545]'>Page</a>
      <br></br>
      <a className='text-[#454545]'>Page</a><br></br>
      <a className='text-[#454545]'>Page</a>
    
    </div>
    <div className=" grid grid-rows-4 gap-0 col-start-6 col-end-7 -mt-10 text-[18px] ">
      
      <a>Topic</a> <br></br>
      <a className='text-[#454545]'>Page</a>
      <br></br>
      <a className='text-[#454545]'>Page</a><br></br>
      <a className='text-[#454545]'>Page</a>
      </div>
      </div>
    </section>
  );
}

export default Footer;