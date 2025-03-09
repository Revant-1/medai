'use client';

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/list-files')
      .then((res) => res.json())
      .then((data) => setDocuments(data.files));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setUploadSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setDocuments([...documents, { name: data.filename }]);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Upload and View Files</h1>

      <input type="file" onChange={handleFileChange} className="my-2" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload
      </button>

      <h2 className="text-lg font-semibold mt-4">Uploaded Files:</h2>
      <ul>
        {documents.map((doc, index) => (
          <li key={index}>
            <a href={`/uploads/${doc.name}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {doc.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
