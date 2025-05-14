import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import Logo from '../../assets/images/logoiu.png';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface Individual {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  likes: number;
  views: number;
}

const IndividualDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [individual, setIndividual] = useState<Individual | null>(null);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false);

  useEffect(() => {
    // Fetch individual details by ID
    axios
      .get(`http://localhost:3300/api/individuals/${id}`)
      .then((response) => {
        const data = response.data;
        setIndividual(data);
        setLikes(data.likes);
        setViews(data.views + 1 ); // Increment views when the page is loaded

        // Optionally update views on the backend
        
      })
      .catch((error) => console.error('Error fetching individual details:', error));
  }, [id]);
  useEffect(() => {
    if (!hasIncrementedViews) {
      axios
        .post(`http://localhost:3300/api/individuals/${id}/increment-views`)
        .then(() => setHasIncrementedViews(true))
        .catch((error) => console.error('Error incrementing views:', error));
    }
  }, [id, hasIncrementedViews]);
  const handleLike = () => {
    setLikes((prevLikes) => prevLikes + 1);

    // Optionally update likes on the backend
    axios.post(`http://localhost:3300/api/individuals/${id}/increment-likes`);
  };

  if (!individual) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
       <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 bg-[#2f398e]" >
              <Link to={'/'}><img src={Logo} className="w-60 md:w-70 rounded-lg " alt="logo" /></Link>
            </div>
      <div className="relative h-64 ">
        <img
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-48 h-48 rounded-full border-4 border-white object-cover"
          src={individual.image}
          alt={`${individual.name}'s profile picture`}
        />
      </div>
      <div className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{individual.name}</h1>
        <p className="text-xl text-indigo-600 mt-2">{individual.role}</p>
        <div className="mt-4">
          <span className="inline-block bg-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-gray-700">
            ID: {individual.id}
          </span>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={handleLike}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            👍 Like ({likes})
          </button>
          <span className="inline-block bg-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-gray-700">
            👁️ Views: {views}
          </span>
        </div>
      </div>
      <div className="px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              {individual.description}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between font-mono p-4 md:p-10">
             
              <section className="my-10 p-4 md:p-10 bg-[#EDE8E0] rounded -lg shadow-md">
                    <div className="text-center">
                      <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
                        <h2 className="text-2xl md:text-3xl font-mono font-bold">Contact Us:</h2>
                        <p className="text-lg md:text-xl font-mono mt-2">Mon-Fri | 9AM-5PM</p>
                        <p className="text-lg md:text-xl font-mono mt-2">IU Alumni Vietnam</p>
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
                    </div>
              </section>
          </div>
      </div>
    </div>
  );
};

export default IndividualDetail;