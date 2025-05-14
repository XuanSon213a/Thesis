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
const Organisation = () => {
    const [org, setOrg] = useState({
        picture: '',
        title: '',
        time: '',
        linkweb: '',
        industry: '',
        descr:'',
        location: '',
        categories: '',
        tags: '',
        contacter: '',
        position: '',
    });
    const [recentOrg, setRecentOrg] = useState([]);
    const [unseenNotifications, setUnseenNotifications] = useState(0);

    interface Org {
        id: number;
      picture: string;
      title: string;
      time: string;
      linkweb: string;
      industry: string;
      descr: string;
      location: string;
      categories: string[];
      tags: string[];
      contacter: string;
      position: string;
    }

    interface ChangeOrg {
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
        axios.get('http://localhost:3300/api/org')
            .then(response => {
                setRecentOrg(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the organisation!', error);
            });

        // Listen for unseen notifications count
        socket.on('unseenNotifications', (count) => {
            setUnseenNotifications(count);
        });

        // Listen for new event notifications
        socket.on('newOrg', (news) => {
            alert(`New Organisation created: ${org.title}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    const handleChange = (e: ChangeOrg) => {
      setOrg({ ...org, [e.target.name]: e.target.value });
    };
    const handleEditorChange = (content: string) => {
        setOrg({ ...org, descr: content }); // Update the description with HTML content
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios.post('http://localhost:3300/api/org', org)
        .then((response: { data: any }) => {
          alert('Organisation created successfully!');
          setOrg({ picture: '', title: '', time: '',linkweb:'',industry:'', descr:'', location: '', categories:'', tags:'',contacter: '', position: '' });
        })
        .catch((error: any) => {
          console.error('There was an error creating the Organisation!', error);
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
                        value={org.picture}
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
                        value={org.title}
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
                        value={org.time}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Link Website</label>
                    <input
                        type="href"
                        name="linkweb"
                        value={org.linkweb}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                    <input
                        type="text"
                        name="industry"
                        value={org.industry}
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
                        value={org.location}
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
                        value={org.categories}
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
                        value={org.tags}
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
                        value={org.descr}
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
                    <label className="block text-sm font-medium text-gray-700">contacter</label>
                    <input
                        type="text"
                        name="contacter"
                        value={org.contacter}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">position</label>
                    <input
                        type="text"
                        name="position"
                        value={org.position}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Add Organisation</button>
            </form>
            <div className="mt-4">
                <h2 className="text-xl font-bold">Notifications</h2>
                <p>Unseen Notifications: {unseenNotifications}</p>
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Recent News</h2>
                    <ul>
                        {recentOrg.map((org: Org) => (
                            <li key={org.id}>
                                <Link to={`/org/${org.id}`}>
                                    {org.title} - {new Date(org.time).toLocaleString()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Organisation;