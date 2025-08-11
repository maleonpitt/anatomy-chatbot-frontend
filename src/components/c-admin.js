import React, { useState } from "react";
import axios from "axios";

const CAdmin = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Upload failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div>
      <h2>Admin Panel - Upload PDF</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload PDF</button>
      <p>{message}</p>
    </div>
  );
};

export default CAdmin;
