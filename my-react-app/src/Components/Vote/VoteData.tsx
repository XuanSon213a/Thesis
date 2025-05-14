import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Define the type for chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}
interface ChartDataYear {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}
const VoteData = () => {
  const [votesData, setVotesData] = useState([]);
  const [chartData, setChartData] = useState<ChartData | null>(null); // Use the defined type
  const [chartDataYear, setChartDataYear] = useState<ChartDataYear | null>(null); 
  const [showChart, setShowChart] = useState(false);
  const [showChartYear, setShowChartYear] = useState(false);
  const fetchVotesData = async () => {
    try {
      if (showChart) {
        // If the chart is already visible, hide it
        setShowChart(false);
        return;
      }

      const response = await axios.get('http://localhost:3300/api/votes-by-major-year');
      setVotesData(response.data);

      // Prepare data for Chart.js
      const labels = response.data.map((item: any) => `${item.year}-${item.major}`);
      const data = response.data.map((item: any) => item.total_votes);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Votes by Major ',
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0,
          },
        ],
      });
      setShowChart(true);
    } catch (error) {
      console.error('Error fetching votes data:', error);
    }
  };
  const fetchVotesDataYear = async () => {
    try {
      if (showChartYear) {
        // If the chart is already visible, hide it
        setShowChartYear(false);
        return;
      }

      const response = await axios.get('http://localhost:3300/api/votes-year');
      setVotesData(response.data);

      // Prepare data for Chart.js
      const labels = response.data.map((item: any) => `${item.year}-${item.major}`);
      const data = response.data.map((item: any) => item.total_votes);

      setChartDataYear({
        labels,
        datasets: [
          {
            label: 'Votes by Year ',
            data,
            borderColor: 'rgb(226, 5, 5)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0,
          },
        ],
      });
      setShowChartYear(true);
    } catch (error) {
      console.error('Error fetching votes data:', error);
    }
  };
  return (
    <div>
      <Link to={'/'}  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Go Back</Link>
      {/* Button to fetch and display the chart */}
      <button
        onClick={fetchVotesData}
        className="bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600"
      >
        {showChart ? 'Hide Chart' : 'Show Votes Major Chart'}
      </button>

      {/* Line Chart */}
      {showChart && chartData && (
        <div className="mt-6" style={{ width: '80%', margin: '0 auto' }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow resizing
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Votes by Major',
                },
              },
            }}
            height={300} // Set chart height
          />
        </div>
      )}
      <button
        onClick={fetchVotesDataYear}
        className="bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600"
      >
        {showChartYear ? 'Hide Chart' : 'Show Votes Year Chart'}
      </button>

      {/* Line Chart Year*/}
      {showChartYear && chartDataYear && (
        <div className="mt-6" style={{ width: '60%', margin: '0 auto' }}>
          <Line
            data={chartDataYear}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow resizing
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Votes by Year',
                },
              },
            }}
            height={300} // Set chart height
          />
        </div>
      )}
    </div>
  );
};

export default VoteData;