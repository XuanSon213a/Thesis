import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from "../../assets/images/logoiu.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faClock, faEnvelope, faIndustry, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

interface Event {
  id: number;
  picture: string;
  title: string;
  time: string;
  descr: string;
  location: string;
  tags: string[];
}
const tagDescriptions: { [key: string]: string } = {
  "#EF": "Education First",
  "#IT": "Information Technology",
  "#HR": "Human Resources",
  // Add more mappings as needed
};
const EventAll = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3300/api/events/all');
        const eventsWithTagsArray = response.data.map((event: any) => ({
          ...event,
          tags: typeof event.tags === 'string' ? event.tags.split(',') : event.tags,
        }));
        setEvents(eventsWithTagsArray);
      } catch (error) {
        console.error('There was an error fetching the events!', error);
      }
    };

    fetchEvents();
  }, []);

  const uniqueTags = Array.from(new Set(events.flatMap(event => event.tags)));
  const uniqueLocations = Array.from(new Set(events.map(event => event.location)));
  const filteredEvents = events.filter(event => {
    const matchesSearchTerm = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.tags.some(tag => (tagDescriptions[tag] || tag).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === "" || event.tags.includes(selectedTag);
    const matchesLocation = selectedLocation === "" || event.location === selectedLocation;
  
    // Ensure the time comparison uses the same format
    const eventDate = new Date(event.time).toISOString().split('T')[0]; // Convert event.time to YYYY-MM-DD
    const matchesTime = selectedTime === "" || eventDate === selectedTime;
  
    return matchesSearchTerm && matchesTag && matchesLocation && matchesTime;
  });

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 bg-[#2f398e]" >
        <Link to={'/'}><img src={Logo} className="w-60 md:w-70 rounded-lg " alt="logo" /></Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">All Events</h1>

      {/* Search Section */}
      <div className="mb-6 relative">
      <input
    type="text"
    placeholder="Search events by title..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onFocus={() => setIsFilterVisible(true)} // Show box on focus
    onBlur={() => setTimeout(() => setIsFilterVisible(false), 200)} // Hide box on blur with delay
    className="w-full p-2 border rounded-md shadow-sm mb-4"
  />

  {/* Conditionally Render Box of Tag Descriptions */}
  {/* Conditionally Render Box of Tag Descriptions */}
{isFilterVisible && (
  <div className="absolute z-10 bg-white border rounded-md shadow-md p-4 max-h-60 overflow-y-auto w-full">
    
    <ul className="space-y-2">
      {Object.entries(tagDescriptions).map(([tag, description]) => (
        <li
          key={tag}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
          onClick={() => {
            setSelectedTag(tag); // Set the selected tag
            setIsFilterVisible(false); // Hide the box after clicking
          }}
        >
          <span className="font-bold">{description}</span>
          <span className="text-gray-500">({tag})</span>
        </li>
      ))}
    </ul>
  </div>
)}
        
        <div className="flex flex-wrap gap-4">
          {/* Filter by Tags */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="p-2 border rounded-md shadow-sm"
          >
            <option value="">All Tags</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>
                {tagDescriptions[tag] || tag} {/* Use description if available */}
              </option>
            ))}
          </select>

          {/* Filter by Location */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="p-2 border rounded-md shadow-sm"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {/* Filter by Time */}
          <input
            type="date"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-2 border rounded-md shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
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
              <p className="text-lg font-mono"><FontAwesomeIcon icon={faLocationDot} />: {event.location}</p>
              <div className="mt-2">
                {event.tags.map(tag => (
                  <span key={tag} className="inline-block bg-gray-200 text-sm px-2 py-1 rounded-md mr-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="footer bg-[#8ed2ed]">
      <div className="border-t-2 border-solid">
          <div className="flex flex-col md:flex-row items-center justify-between font-mono p-4 md:p-10">
              
            <Link to={'/'}><img src={Logo} className="w-100 rounded-lg" alt="logo" /></Link>
            {/* <Link to={'contact'} className="mt-4 md:mt-0">Question {ContactIcon}</Link> */}
            {/* Contact Section */}
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
    </div>
  );
};

export default EventAll;