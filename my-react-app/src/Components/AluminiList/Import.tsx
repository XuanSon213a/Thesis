import React, { useState } from 'react';
import axios from 'axios';

const Import: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Choose File');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);  // Lưu file vào state
      setFileName(e.target.files[0].name);  // Cập nhật tên file được chọn
    } else {
      setFile(null);
      setFileName('Choose File');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('excel', file);

    try {
      const response = await axios.post('http://localhost:3300/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Đảm bảo gửi cookie kèm theo request nếu cần
      });

      setMessage(response.data.msg);
    } catch (error) {
      setMessage("Failed to upload file. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-mono font-bold underline">Upload Excel File</h1>
      <form onSubmit={handleSubmit}> 
       
        <label className="custom-file-upload bg-gray-200 p-2 rounded-lg cursor-pointer">
          {fileName}
          <input 
            
            type="file" 
            accept=".xlsx" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} // Ẩn input file gốc
          />
        </label>
        <button 
          className="align-middle select-none text-center ml-10 py-3 px-6 rounded-lg bg-cyan-900 text-white shadow-md shadow-gray-900/10" 
          type="submit"
        >
          Upload
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Import;
