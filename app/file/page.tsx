'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FileDocument {
  name: string;
  url: string;
  pathname: string;
  type: string;
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<FileDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/list-files');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.files);
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    }
  };

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
        await fetchDocuments();
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

  const handleDelete = async (pathname: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pathname }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchDocuments();
      } else {
        setError(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload and View Files</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          File uploaded successfully!
        </div>
      )}

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Upload New File</h2>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
        <button 
          onClick={handleUpload} 
          disabled={isLoading || !selectedFile}
          className={`px-4 py-2 rounded text-white ${
            isLoading || !selectedFile 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>
        
        {documents.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {doc.name}
                  </a>
                  <p className="text-sm text-gray-500">{doc.type.toUpperCase()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(doc.pathname)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
