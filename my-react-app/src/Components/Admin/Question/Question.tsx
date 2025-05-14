import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft, faEnvelope  } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Logo1 from "../../../assets/images/LogoHCMIU.svg";
import { useNavigate } from 'react-router-dom';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const Question: React.FC = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
 
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [rangeMessages, setRangeMessages] = useState<ContactMessage[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch all contact messages
    const fetchContactMessages = async () => {
      try {
        const response = await axios.get('http://localhost:3300/api/contact');
        setContactMessages(response.data);
      } catch (error) {
        console.error('Error fetching contact messages:', error);
      }
    };

    fetchContactMessages();
  }, []);


  
  useEffect(() => {
    if (dateRange) {
      // Fetch messages for the selected date range
      const fetchRangeMessages = async () => {
        try {
          const response = await axios.get('http://localhost:3300/api/contact/range', {
            params: {
              startDate: dateRange[0].toISOString().split('T')[0],
              endDate: dateRange[1].toISOString().split('T')[0],
            },
          });
          setRangeMessages(response.data);
        } catch (error) {
          console.error('Error fetching range messages:', error);
        }
      };

      fetchRangeMessages();
    }
  }, [dateRange]);

  const chartData = {
    labels: rangeMessages.map((message) => new Date(message.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Messages',
        data: rangeMessages.map((_, index) => index + 1),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };


  
  // Function to apply custom styles to selected date range
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && dateRange) {
      const [start, end] = dateRange;
      if (date >= start && date <= end) {
        return 'bg-blue-200'; // Add a custom class for selected range
      }
    }
    return '';
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${Logo1})` }}
    >
      <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Navigate Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-500 hover:underline mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold mb-4 text-center">Contact Messages Management</h1>
          <h2 className="text-2xl font-bold mb-4">Select a Date Range</h2>
          <Calendar
            selectRange
            onChange={(range: any) => setDateRange(range)}
            tileClassName={tileClassName}
            className="mb-6"
          />

          {dateRange && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Messages from {dateRange[0].toLocaleDateString()} to {dateRange[1].toLocaleDateString()}
              </h3>
              {rangeMessages.length > 0 ? (
                <Line data={chartData} />
              ) : (
                <p className="text-gray-700">No messages found for this range.</p>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4">All Contact Messages</h2>
          {contactMessages.length > 0 ? (
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Message</th>
                  <th className="border border-gray-300 px-4 py-2">Submitted At</th>
                  <th className="border border-gray-300 px-4 py-2">Get feedback</th>
                </tr>
              </thead>
              <tbody>
                {contactMessages.map((message) => (
                  <tr key={message.id}>
                    <td className="border border-gray-300 px-4 py-2">{message.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{message.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a
                        href={`mailto:${message.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {message.email}
                      </a>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{message.message}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(message.created_at).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-4 text-center">
                      <a
                        href={`https://mail.google.com/`}
                        className="text-blue-500 hover:underline"
                      >
                        <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '24px' }} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-700">No messages found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;