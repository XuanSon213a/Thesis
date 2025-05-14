import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logo from "../../assets/images/logoiu.png";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [totalAlumnis, setTotalAlumnis] = useState(0);
  const [totalOnlineUsers, setTotalOnlineUsers] = useState(0);
  const [alumniByYear, setAlumniByYear] = useState<{ year: string, count: number }[]>([]);
  const [eventParticipation, setEventParticipation] = useState<{ eventTitle: string, participants: number, nonParticipants: number }[]>([]);
  const [newsParticipation, setNewsParticipation] = useState<{ newsTitle: string, participants: number, nonParticipants: number }[]>([]);
  const [orgParticipation, setOrgParticipation] = useState<{ orgTitle: string, participants: number, nonParticipants: number }[]>([]);

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    alumniByYear: false,
    alumniDistribution: false,
    eventParticipation: false,
    newsParticipation: false,
  });

  useEffect(() => {
    axios.get('http://localhost:3300/api/alumni/count')
      .then((res) => setTotalAlumnis(res.data.count))
      .catch((err) => console.log(err));

    axios.get('http://localhost:3300/api/online-users/count')
      .then((res) => setTotalOnlineUsers(res.data.count))
      .catch((err) => console.log(err));

    axios.get('http://localhost:3300/api/alumni/group-by-year')
      .then((res) => {
        setAlumniByYear(res.data.data.map((item: any) => ({
          year: item._id,
          count: item.count
        })));
      })
      .catch((err) => console.log(err));

    axios.get('http://localhost:3300/api/events/participation')
      .then((res) => {
        setEventParticipation(res.data.map((item: any) => ({
          eventTitle: item.eventTitle,
          participants: item.participants,
          nonParticipants: item.nonParticipants,
        })));
      })
      .catch((err) => console.log(err));

    axios.get('http://localhost:3300/api/news/participation')
      .then((res) => {
        setNewsParticipation(res.data.map((item: any) => ({
          newsTitle: item.newsTitle,
          participants: item.participants,
          nonParticipants: item.nonParticipants,
        })));
      })
      .catch((err) => console.log(err));
      axios.get('http://localhost:3300/api/org/participation')
      .then((res) => {
        setOrgParticipation(res.data.map((item: any) => ({
          orgTitle: item.orgTitle,
          participants: item.participants,
          nonParticipants: item.nonParticipants,
        })));
      })
      .catch((err) => console.log(err));
  }, []);

  const toggleSection = (section: string) => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const barChartData = {
    labels: alumniByYear.map(item => item.year),
    datasets: [
      {
        label: 'Number of Alumni',
        data: alumniByYear.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: alumniByYear.map(item => item.year),
    datasets: [
      {
        label: 'Number of Alumni',
        data: alumniByYear.map(item => item.count),
        backgroundColor: alumniByYear.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
        borderColor: alumniByYear.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`),
        borderWidth: 1,
      },
    ],
  };

  const columnChartData = {
    labels: eventParticipation.map(item => item.eventTitle),
    datasets: [
      {
        label: 'Participants',
        data: eventParticipation.map(item => item.participants),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Non-Participants',
        data: eventParticipation.map(item => item.nonParticipants),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const columnChartData2 = {
    labels: newsParticipation.map(item => item.newsTitle),
    datasets: [
      {
        label: 'Participants',
        data: newsParticipation.map(item => item.participants),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Non-Participants',
        data: newsParticipation.map(item => item.nonParticipants),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };
  const columnChartData3 = {
    labels: orgParticipation.map(item => item.orgTitle),
    datasets: [
      {
        label: 'Participants',
        data: orgParticipation.map(item => item.participants),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Non-Participants',
        data: orgParticipation.map(item => item.nonParticipants),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard p-6">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 bg-[#2f398e]">
        <Link to={'/'}><img src={Logo} className="w-40 md:w-70 rounded-lg" alt="logo" /></Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Total Alumnis</h2>
          <p className="text-2xl">{totalAlumnis}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Total Mesage Online Users</h2>
          <p className="text-2xl">{totalOnlineUsers}</p>
        </div>
      </div>

      {/* Alumni by School Year */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => toggleSection('alumniByYear')}>
          Alumni by School Year {collapsedSections.alumniByYear ? '▲' : '▼'}
        </h2>
        {!collapsedSections.alumniByYear && <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Alumni by School Year' } } }} />}
      </div>

      {/* Alumni Distribution */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => toggleSection('alumniDistribution')}>
          Alumni Distribution {collapsedSections.alumniDistribution ? '▲' : '▼'}
        </h2>
        {!collapsedSections.alumniDistribution && (
          <div style={{ height: '500px', width: '500px' }}>
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Alumni Distribution by Year' } } }} />
          </div>
        )}
      </div>

      {/* Event Participation */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => toggleSection('eventParticipation')}>
          Event Participation {collapsedSections.eventParticipation ? '▲' : '▼'}
        </h2>
        {!collapsedSections.eventParticipation && (
          <Bar
            data={columnChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Event Participation (Participants vs Non-Participants)' },
              },
              scales: {
                x: { title: { display: true, text: 'Events Titles', font: { weight: 'bold', size: 14 } } },
                y: { title: { display: true, text: 'Number of Votes', font: { weight: 'bold', size: 14 } } },
              },
            }}
          />
        )}
      </div>

      {/* News Participation */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => toggleSection('newsParticipation')}>
          News Participation {collapsedSections.newsParticipation ? '▲' : '▼'}
        </h2>
        {!collapsedSections.newsParticipation && (
          <Bar
            data={columnChartData2}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'News Participation (Participants vs Non-Participants)' },
              },
              scales: {
                x: { title: { display: true, text: 'News Titles', font: { weight: 'bold', size: 14 } } },
                y: { title: { display: true, text: 'Number of Votes', font: { weight: 'bold', size: 14 } } },
              },
            }}
          />
        )}
      </div>
      {/* Org Participation */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => toggleSection('orgParticipation')}>
          Organisation Participation {collapsedSections.orgParticipation ? '▲' : '▼'}
        </h2>
        {!collapsedSections.orgParticipation && (
          <Bar
            data={columnChartData3}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Organisation Participation (Participants vs Non-Participants)' },
              },
              scales: {
                x: { title: { display: true, text: 'Organisation Titles', font: { weight: 'bold', size: 14 } } },
                y: { title: { display: true, text: 'Number of Votes', font: { weight: 'bold', size: 14 } } },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;