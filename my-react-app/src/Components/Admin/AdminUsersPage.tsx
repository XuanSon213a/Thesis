import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../Admin/AdminSidebar'; // Import AdminSidebar
import { Link } from 'react-router-dom';
import Logo from "../../assets/images/logoiu.png";

interface User {
  id: number;
  _id: string;
  fullname: string;
  email: string;
  role: string;
}

const AdminUsersPage: React.FC = () => {
  const [mysqlUsers, setMysqlUsers] = useState<User[]>([]); // MySQL users
  const [mongoUsers, setMongoUsers] = useState<User[]>([]); // MongoDB users
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>(''); // State to track the user's role

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from MySQL
        const mysqlResponse = await axios.get('http://localhost:3300/api/users/mysql');
        console.log('MySQL API response:', mysqlResponse.data);
        setMysqlUsers(mysqlResponse.data);

        // Fetch users from MongoDB
        const mongoResponse = await axios.get('http://localhost:3300/api/users/mongo');
        console.log('MongoDB API response:', mongoResponse.data);
        setMongoUsers(mongoResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again later.');
        setLoading(false);
      }
    };

    const fetchRole = () => {
      const userRole = localStorage.getItem('role') || 'user'; // Default to 'user'
      setRole(userRole);
    };

    fetchUsers();
    fetchRole();
  }, []);

  const handleSetAdmin = async (userId: number) => {
    try {
      await axios.put(`http://localhost:3300/api/users/${userId}/role`, { role: 'admin' });
      alert('User role updated to admin successfully');
      // Refetch users to update the UI
      const response = await axios.get('http://localhost:3300/api/users/mysql');
      setMysqlUsers(response.data);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`http://localhost:3300/api/users/${userId}`);
      alert('User deleted successfully');
      // Remove the deleted user from the state
      setMysqlUsers(mysqlUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };
const handleDeleteMongoUser = async (userId: string) => {
  try {
    await axios.delete(`http://localhost:3300/api/users/mongo/${userId}`);
    alert('MongoDB user deleted successfully');
    // Remove the deleted user from the state
    setMongoUsers(mongoUsers.filter((user) => user._id !== userId));
  } catch (err) {
    console.error('Error deleting MongoDB user:', err);
    alert('Failed to delete MongoDB user. Please try again.');
  }
};
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-lg text-red-500">{error}</div>;
  }

  return (
    <div className="flex">
      {/* Render AdminSidebar if the role is 'admin' */}
      {role === 'admin' && <AdminSidebar />}
      
      <div className="flex-1 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-10 bg-[#2f398e]">
          <Link to={'/'}><img src={Logo} className="w-60 md:w-70 rounded-lg" alt="logo" /></Link>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Admin Users Page</h1>

        {/* MySQL Users Section */}
        <h2 className="text-xl font-bold mb-4">MySQL Users</h2>
        <div className="overflow-x-auto mb-8">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Fullname</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mysqlUsers.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.fullname}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                  <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleSetAdmin(user.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                      >
                        Set as Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       {/* MongoDB Users Section */}
<h2 className="text-xl font-bold mb-4">MongoDB Users</h2>
<div className="overflow-x-auto">
  <table className="table-auto w-full border-collapse border border-gray-300">
    <thead className="bg-gray-100">
      <tr>
        <th className="border border-gray-300 px-4 py-2 text-left">Fullname</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {mongoUsers.map((user) => (
        <tr key={user.email} className="hover:bg-gray-50">
          <td className="border border-gray-300 px-4 py-2">{user.fullname}</td>
          <td className="border border-gray-300 px-4 py-2">{user.email}</td>
          <td className="border border-gray-300 px-4 py-2">{user.role}</td>
          <td className="border border-gray-300 px-4 py-2 flex space-x-2">
            <button
              onClick={() => handleDeleteMongoUser(user._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
};

export default AdminUsersPage;