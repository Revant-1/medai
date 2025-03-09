"use client";

import React, { useState, useRef, useEffect } from 'react';
import { User, Menu, Upload, Trash, Edit, Eye, X, Check, FileText, Image, File } from "lucide-react";
import Nav from '@/components/Nav';
import Link from "next/link";

// Fix the document type definition
interface Document {
  id: string | number;
  name: string;
  type: string;
  date: string;
  size?: string;
  modified?: string | Date;
}

// Define a file type for the API response
interface FileResponse {
  name: string;
  type: string;
  modified: string | number | Date;
  size: number;
  path?: string;
  created?: string | Date;
}

const DocumentsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: 'Medical Report 2023', type: 'pdf', date: '2023-10-15' },
    { id: 2, name: 'Prescription 04/2022', type: 'pdf', date: '2022-04-22' },
    { id: 3, name: 'Lab Results 06/2021', type: 'pdf', date: '2021-06-10' },
    { id: 4, name: 'Wellness Goals', type: 'docx', date: '2023-08-05' },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/list-files');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.files.map((file: FileResponse) => ({
          id: file.name,
          name: file.name,
          type: file.type,
          date: new Date(file.modified).toLocaleDateString(),
          size: formatFileSize(file.size)
        })));
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  

  // Filter documents based on search query
  // Filter documents based on search query
const filteredDocuments = documents
.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
.sort((a, b) => {
  const aValue = a[sortBy as keyof Document] ?? ''; // Default to empty string if undefined
  const bValue = b[sortBy as keyof Document] ?? ''; // Default to empty string if undefined

  if (typeof aValue === "string" && typeof bValue === "string") {
    return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  } else if (typeof aValue === "number" && typeof bValue === "number") {
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  } else {
    return 0; // If types don't match, keep order unchanged
  }
});


  // Fix the handleFileChange function type
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reset form and refresh document list
        setSelectedFile(null);
        setIsUploadModalOpen(false);
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

  // Fix the deleteDocument function parameter type
  const deleteDocument = async (filename: string | number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchDocuments();
      } else {
        setError(data.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the startEditDocument function parameter type
  const startEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setNewFileName(doc.name);
  };

  const saveDocumentName = () => {
    if (!newFileName.trim()) return;
    
    setDocuments(documents.map(doc => 
      doc.id === editingDocument?.id 
        ? { ...doc, name: newFileName } 
        : doc
    ));
    setEditingDocument(null);
  };

  // Fix the viewDocument function parameter type
  const viewDocument = (doc: Document) => {
    // Open the document in a new tab
    window.open(`/api/view-file?filename=${encodeURIComponent(doc.name)}`, '_blank');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
      {/* Show loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>Loading...</p>
          </div>
        </div>
      )}
      
      {/* Show error message if any */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="absolute top-0 right-0 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }
            lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
            w-64 bg-white shadow-lg
          `}
        >
          <div className="p-6">
            <Link href="/home">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">My Documents</h1>
              <p className="text-gray-600">Manage your health records and documents</p>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                
                <button
                  onClick={() => {
                    setIsUploadModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-green-600 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    {editingDocument && editingDocument.id === doc.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingDocument(null)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={saveDocumentName}
                            className="p-1 rounded-full hover:bg-green-100"
                          >
                            <Check className="h-5 w-5 text-green-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start">
                          <div className="mr-3">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">{doc.name}</h3>
                            <div className="flex gap-2 text-sm text-gray-500">
                              <span className="uppercase">{doc.type}</span>
                              <span>•</span>
                              <span>{doc.date}</span>
                              {doc.size && (
                                <>
                                  <span>•</span>
                                  <span>{doc.size}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => viewDocument(doc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => startEditDocument(doc)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            title="Rename"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No documents found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try different search terms' : 'Upload your first document'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Document</h3>
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mb-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  {selectedFile 
                    ? selectedFile.name 
                    : 'Click to upload or drag and drop'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOCX or image files (max. 10MB)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className={`px-4 py-2 rounded-md text-white ${
                  !selectedFile 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-lime-500 to-green-600 hover:opacity-90'
                }`}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-4/5 flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{viewingDocument.name}</h3>
              <button 
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-gray-100">
              <div className="h-full flex items-center justify-center">
                {/* This would be replaced with actual document preview functionality */}
                {viewingDocument.type === 'pdf' ? (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">PDF Viewer would be implemented here</p>
                  </div>
                ) : viewingDocument.type === 'docx' || viewingDocument.type === 'doc' ? (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Word Document Viewer would be implemented here</p>
                  </div>
                ) : ['jpg', 'jpeg', 'png'].includes(viewingDocument.type) ? (
                  <div className="text-center">
                    <Image className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Image Viewer would be implemented here</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <File className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600">File preview not available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => startEditDocument(viewingDocument)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setViewingDocument(null);
                  // Implementation for download would go here
                  alert(`Downloading ${viewingDocument.name}...`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-500 to-green-600 text-white rounded-md hover:opacity-90"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;