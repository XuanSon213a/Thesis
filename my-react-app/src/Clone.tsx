import React ,{useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Logo from "../src/assets/images/logoiu.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faList } from '@fortawesome/free-solid-svg-icons'

import { faQuestion } from '@fortawesome/free-solid-svg-icons'

import axios from "axios";


const Search = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const List = <FontAwesomeIcon icon={faList} />

const Contact = <FontAwesomeIcon icon={faQuestion} />



const Clone =() => {
 
  return (
    <>
    
    
   
   
    </>
  );
}
export default Clone;