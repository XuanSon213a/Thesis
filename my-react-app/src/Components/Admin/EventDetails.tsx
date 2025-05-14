import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from "../../assets/images/logoiu.png";
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface Event {
  id: number;
  picture: string;
  title: string;
  time: string;
  descr: string;
  location: string;
  author: string;
}

interface Comment {
  id: number;
  event_id: number;
  comment: string;
  created_at: string;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  useEffect(() => {
    axios.get(`http://localhost:3300/api/events/${id}`)
      .then(response => {
        setEvent(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the event details!', error);
      });

    axios.get(`http://localhost:3300/api/events/${id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the comments!', error);
      });
  }, [id]);
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3300/api/votes/${id}`)
        .then(response => {
          setYesVotes(response.data.yesVotes || 0);
          setNoVotes(response.data.noVotes || 0);
        })
        .catch(error => {
          console.error('Error fetching votes:', error);
        });
    }
  }, [id]);
  useEffect(() => {
    if (event) {
      const interval = setInterval(() => {
        const eventDate = new Date(event.time).getTime();
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [event]);

  const handleVote = (vote: 'yes' | 'no') => {
    if (hasVoted) return;

    axios.post('http://localhost:3300/api/votes', { eventId: id, vote })
      .then(() => {
        setHasVoted(true);
        setVoteSuccess(true);
        setTimeout(() => setVoteSuccess(false), 3000); // Hide success message after 3 seconds

        // Update vote counts locally
        if (vote === 'yes') setYesVotes(yesVotes + 1);
        if (vote === 'no') setNoVotes(noVotes + 1);
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          alert('You have already voted for this event.');
        } else {
          console.error('Error submitting vote:', error);
        }
      });
  };
  const totalVotes = yesVotes + noVotes;
  const yesPercentage = totalVotes ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercentage = totalVotes ? Math.round((noVotes / totalVotes) * 100) : 0;
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`http://localhost:3300/api/events/${id}/comments`, { comment: newComment })
      .then(response => {
        setComments([response.data, ...comments]);
        setNewComment('');
      })
      .catch(error => {
        console.error('There was an error posting the comment!', error);
      });
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    
    <div className="p-10">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 bg-[#2f398e]" >
        <Link to={'/'}><img src={Logo} className="w-40 md:w-70 rounded-lg " alt="logo" /></Link>
      </div>
    <h1 className="text-2xl font-bold mb-6">{event.title}</h1>
    <div className="flex">
      <img
        src={event.picture}
        alt={event.title}
        className="w-400 h-500 object-cover rounded-md"
        style={{ width: '400px', height: '300px', objectFit: 'cover' }}
      />
      <div className="ml-8">
        <p className="text-lg font-mono">Date: {new Date(event.time).toLocaleDateString()}</p>
        <p className="text-lg font-mono">Time: {new Date(event.time).toLocaleTimeString()}</p>
        <p className="text-lg font-mono">Location: {event.location}</p>
        
        <div className="mt-4 flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gray-200 p-4 rounded-lg">
              {timeLeft.days}
            </div>
            <p className="text-sm text-gray-600 mt-2">DAYS</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gray-200 p-4 rounded-lg">
              {timeLeft.hours}
            </div>
            <p className="text-sm text-gray-600 mt-2">HOURS</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gray-200 p-4 rounded-lg">
              {timeLeft.minutes}
            </div>
            <p className="text-sm text-gray-600 mt-2">MINUTES</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gray-200 p-4 rounded-lg">
              {timeLeft.seconds}
            </div>
            <p className="text-sm text-gray-600 mt-2">SECONDS</p>
          </div>
        </div>
      </div>
    </div>
    <div className="prose mt-8">
      <div dangerouslySetInnerHTML={{ __html: event.descr }} />
    </div>
    <p className="text-lg font-mono mt-4"><b>Author</b>: {event.author}</p>
    {/* Voting Section */}
    <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Would you like to join us? </h2>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={() => handleVote('yes')}
            disabled={hasVoted}
            className={`px-4 py-2 rounded-md text-white ${
              hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => handleVote('no')}
            disabled={hasVoted}
            className={`px-4 py-2 rounded-md text-white ${
              hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            No
          </button>
        </div>

        {/* Vote Ratio */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Vote Results</h3>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-l-full"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm">{yesPercentage}% Yes</span>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-l-full"
                style={{ width: `${noPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm">{noPercentage}% No</span>
          </div>
        </div>

        {/* Success Notification */}
        {voteSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
            Thank you for voting!
          </div>
        )}
      </div>
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Add a comment"
          required
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded-md">Submit</button>
      </form>
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 border rounded-lg shadow-md">
            <p>{comment.comment}</p>
            <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {/* Contact Section */}
            <section className="my-10 p-4 md:p-10 bg-[#EDE8E0]">
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
);
};

export default EventDetails;