import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from "../../../assets/images/logoiu.png";
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface News {
  id: number;
  picture: string;
  title: string;
  time: string;
  descr: string;
  location: string;
  categories: string;
  tags: string;
  author: string;
}

interface Comment {
  id: number;
  news: number;
  comment: string;
  created_at: string;
}

const NewsDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [visibleNewsCount, setVisibleNewsCount] = useState(5);
 const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  useEffect(() => {
    axios.get(`http://localhost:3300/api/news/${id}`)
      .then(response => {
        setNews(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the news details!', error);
      });

    axios.get(`http://localhost:3300/api/news/${id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the comments!', error);
      });
  }, [id]);
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3300/api/newsvotes/${id}`)
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
    if (news) {
      const interval = setInterval(() => {
        const newDate = new Date(news.time).getTime();
        const now = new Date().getTime();
        const distance = newDate - now;

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
  }, [news]);

  useEffect(() => {
    if (news) {
      axios
        .get(`http://localhost:3300/api/news/related`, {
          params: { category: news.categories, tags: news.tags },
        })
        .then((response) => {
          // Ensure the response is an array
          setRelatedNews(Array.isArray(response.data) ? response.data : []);
        })
        .catch((error) => {
          console.error('Error fetching related news:', error);
          setRelatedNews([]); // Fallback to an empty array on error
        });
    }
  }, [news]);
  const handleShowMore = () => {
    setVisibleNewsCount((prevCount) => prevCount + 5); // Increase the visible news count by 5
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`http://localhost:3300/api/news/${id}/comments`, { comment: newComment })
      .then(response => {
        setComments([response.data, ...comments]);
        setNewComment('');
      })
      .catch(error => {
        console.error('There was an error posting the comment!', error);
      });
  };

  if (!news) {
    return <div>Loading...</div>;
  }
  //Vote
  const handleVote = (vote: 'yes' | 'no') => {
    if (hasVoted) return;

    axios.post('http://localhost:3300/api/newsvotes', { newsId: id, vote })
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
          alert('You have already voted for this news.');
        } else {
          console.error('Error submitting vote:', error);
        }
      });
  };
  const totalVotes = yesVotes + noVotes;
  const yesPercentage = totalVotes ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercentage = totalVotes ? Math.round((noVotes / totalVotes) * 100) : 0;
  return (
  <div className="p-10 flex flex-col">
    {/* Logo Section */}
    <div className="flex flex-col items-center justify-center p-4 md:p-10 bg-[#2f398e] w-full">
      <Link to={'/'}>
        <img
          src={Logo}
          className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-lg"
          alt="logo"
        />
      </Link>
    </div>

    {/* Main Content and Related News */}
    <div className="flex flex-col md:flex-row mt-8">
      {/* Main Content */}
      <div className="flex-1 md:mr-8">
        <h1 className="text-2xl font-bold mb-6">{news.title}</h1>
        <div className="flex">
          <img
            src={news.picture}
            alt={news.title}
            className="w-400 h-500 object-cover rounded-md"
            style={{ width: '400px', height: '300px', objectFit: 'cover' }}
          />
          <div className="ml-8">
            <p className="text-lg font-mono">Date: {new Date(news.time).toLocaleDateString()}</p>
            <p className="text-lg font-mono">Time: {new Date(news.time).toLocaleTimeString()}</p>
            <p className="text-lg font-mono">Location: {news.location}</p>
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
          <div dangerouslySetInnerHTML={{ __html: news.descr }} />
        </div>
        <p className="text-lg font-mono mt-4"><b>Author</b>: {news.author}</p>
        <div className="mt-4">
          <b>Tags</b>:
          <div className="flex flex-wrap gap-2 mt-2">
            {news.tags.split(',').map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-colors"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
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
        </div>
      </div>

      {/* Related News Sidebar */}
      <div className="w-full md:w-1/4">
  <h2 className="text-xl font-bold mb-4 text-center">Related News</h2>
  <div className="space-y-4">
    {relatedNews.map((related) => (
      <Link
        key={related.id}
        to={`/news/${related.id}`}
        className="block p-4 border rounded-lg shadow-md hover:bg-gray-100 transition"
      >
        <div className="flex items-center">
          <img
            src={related.picture}
            alt={related.title}
            className="w-16 h-16 object-cover rounded-md mr-4"
          />
          <div>
            <h3 className="text-lg font-semibold">{related.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(related.time).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
  {relatedNews.length > visibleNewsCount && (
    <button
      onClick={handleShowMore}
      className="mt-4 bg-blue-500 text-white p-2 rounded-md w-full"
    >
      Show More
    </button>
  )}
</div>

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
);
};

export default NewsDetails;