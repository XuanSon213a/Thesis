import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  return (
    <div className="admin-sidebar bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <ul>
        <li className="mb-4">
          <Link to="/admin/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/organisation" className="hover:underline">
          Organisation
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/users" className="hover:underline">
            Users
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/events" className="hover:underline">
            Events
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/news" className="hover:underline">
            News
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/jobs" className="hover:underline">
            Jobs
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/alumnis" className="hover:underline">
            Alumnis
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/manage-outstanding" className="hover:underline">
            Outstanding Alumni
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/Question" className="hover:underline">
            Question from client 
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;