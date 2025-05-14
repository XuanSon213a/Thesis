import React, { useEffect, useState } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react'; 
import Logo from "../../../assets/images/logoiu.png";
import tinymce from 'tinymce';
type BlobInfo = {
    id: string;
    name: string;
    filename: string;
    blob: () => Blob;
    base64: () => string;
    blobUri: () => string;
    uri: () => string | undefined;
};
const News = () => {
    const [news, setNews] = useState({
        picture: '',
        title: '',
        time: '',
        descr:'',
        location: '',
        categories: '',
        tags: '',
        author: ''
    });
    const [recentNews, setRecentNews] = useState([]);
    const [unseenNotifications, setUnseenNotifications] = useState(0);

    interface News {
        id: number;
      picture: string;
      title: string;
      time: string;
      descr: string;
      location: string;
      categories: string[];
      tags: string[];
      author: string;
    }

    interface ChangeNews {
      target: {
        name: string;
        value: string;
      };
    }
    
    const socket = io('http://localhost:3300', {
        auth: {
            token: localStorage.getItem('token') // Assuming you store the token in localStorage
        }
    });

    useEffect(() => {
        // Fetch the 5 most recent events
        axios.get('http://localhost:3300/api/news')
            .then(response => {
                setRecentNews(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the news!', error);
            });

        // Listen for unseen notifications count
        socket.on('unseenNotifications', (count) => {
            setUnseenNotifications(count);
        });

        // Listen for new event notifications
        socket.on('newNews', (news) => {
            alert(`New News created: ${news.title}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    const handleChange = (e: ChangeNews) => {
      setNews({ ...news, [e.target.name]: e.target.value });
    };
    const handleEditorChange = (content: string) => {
        setNews({ ...news, descr: content }); // Update the description with HTML content
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      
        // Ensure tags are properly formatted (e.g., split by spaces and prefixed with #)
        const formattedTags = news.tags
          .split(' ')
          .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
          .join(' ');
      
        const updatedNews = { ...news, tags: formattedTags };
      
        axios
          .post('http://localhost:3300/api/news', updatedNews)
          .then((response: { data: any }) => {
            alert('News created successfully!');
            setNews({
              picture: '',
              title: '',
              time: '',
              descr: '',
              location: '',
              categories: '',
              tags: '',
              author: '',
            });
          })
          .catch((error: any) => {
            console.error('There was an error creating the News!', error);
          });
      };

    return (
        <div className="p-10">
            <Link to={'/'}><img src={Logo} className="w-40 md:w-70 rounded-lg" alt="logo" />GO BACK</Link>
            <h1 className="text-2xl font-bold mb-6">Create News</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Picture URL</label>
                    <input
                        type="text"
                        name="picture"
                        value={news.picture}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={news.title}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                        type="datetime-local"
                        name="time"
                        value={news.time}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={news.location}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        name="categories"
                        value={news.categories}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <input
                        type="text"
                        name="tags"
                        value={news.tags}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    {/* TinyMCE Editor */}
                    <Editor
                        apiKey="wuv1x2pmeahwjmipudjsooln5cr5a7z5vmkzqrxl6tr89c2p"
                        value={news.descr}
                        onEditorChange={handleEditorChange}
                        init={{
                            height: 300,
                            menubar: true,
                            plugins: [
                                'advlist autolink lists link image charmap print preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount'
                            ],
                            toolbar:
                                'undo redo | formatselect | bold italic backcolor | \
                                alignleft aligncenter alignright alignjustify | \
                                bullist numlist outdent indent | removeformat | help | image | media',
                            images_upload_handler: async (blobInfo: BlobInfo, progress: (percent: number) => void) => {
                                const formData = new FormData();
                                formData.append('file', blobInfo.blob(), blobInfo.filename);

                                try {
                                    const response = await axios.post('http://localhost:3300/upload-image', formData, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                        },
                                        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                                            if (progressEvent.total !== undefined) {
                                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                                progress(percentCompleted);
                                            }
                                        },
                                    });
                                    return response.data.location;
                                } catch (error) {
                                    console.error('Error uploading image:', error);
                                    throw new Error('Image upload failed');
                                }
                            },
                        }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <input
                        type="text"
                        name="author"
                        value={news.author}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Create News</button>
            </form>
            <div className="mt-4">
                <h2 className="text-xl font-bold">Notifications</h2>
                <p>Unseen Notifications: {unseenNotifications}</p>
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Recent News</h2>
                    <ul>
                        {recentNews.map((news: News) => (
                            <li key={news.id}>
                                <Link to={`/news/${news.id}`}>
                                    {news.title} - {new Date(news.time).toLocaleString()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default News;