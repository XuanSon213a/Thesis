import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from "../../assets/images/logoiu.png";
interface Individual {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
}

const ManageOutstandingIndividuals = () => {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [formData, setFormData] = useState<Partial<Individual>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch individuals
  useEffect(() => {
    axios.get('http://localhost:3300/api/individuals')
      .then(response => setIndividuals(response.data))
      .catch(error => console.error('Error fetching individuals:', error));
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or edit individual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editId !== null) {
      // Edit individual
      axios.put(`http://localhost:3300/api/individuals/${editId}`, formData)
        .then(() => {
          setIndividuals(individuals.map(ind => ind.id === editId ? { ...ind, ...formData } as Individual : ind));
          resetForm();
        })
        .catch(error => console.error('Error updating individual:', error));
    } else {
      // Add individual
      axios.post('http://localhost:3300/api/individuals', formData)
        .then(response => {
          setIndividuals([...individuals, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error adding individual:', error));
    }
  };

  // Delete individual
  const handleDelete = (id: number) => {
    axios.delete(`http://localhost:3300/api/individuals/${id}`)
      .then(() => setIndividuals(individuals.filter(ind => ind.id !== id)))
      .catch(error => console.error('Error deleting individual:', error));
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setIsEditing(false);
    setEditId(null);
  };

  // Populate form for editing
  const handleEdit = (individual: Individual) => {
    setFormData(individual);
    setIsEditing(true);
    setEditId(individual.id);
  };

  return (
    <div className="p-4">
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
      <h2 className="text-2xl font-bold mb-4">Manage Outstanding Individuals</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isEditing ? 'Update Individual' : 'Add Individual'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Individuals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {individuals.map(individual => (
          <div key={individual.id} className="p-4 border rounded shadow">
            <img src={individual.image} alt={individual.name} className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="text-xl font-bold">{individual.name}</h3>
            <p className="text-sm text-gray-600">{individual.role}</p>
            <p className="text-sm text-gray-600">{individual.description}</p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(individual)}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(individual.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOutstandingIndividuals;