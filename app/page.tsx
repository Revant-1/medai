"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50 flex flex-col items-center justify-center">
      <div className={`max-w-4xl p-6 bg-white rounded-lg shadow-lg ${isAnimated ? 'animate-fade-in' : ''}`}>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">MediSage</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">Your Personal Health Assistant</p>

        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-center md:space-x-4">
          <Link href="/home" className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </Link>
          <Link href="/chat" className="bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Try the Demo
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg shadow-md bg-gray-50 ${isAnimated ? 'animate-slide-in-left' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Leverage the power of artificial intelligence to analyze your medical reports with precision.</p>
            </div>
            <div className={`p-4 rounded-lg shadow-md bg-gray-50 ${isAnimated ? 'animate-slide-in-right' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">Personalized Insights</h3>
              <p className="text-gray-600">Receive tailored health insights and recommendations based on your individual data.</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg shadow-md bg-gray-50 ${isAnimated ? 'animate-slide-in-up' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">Upload Reports</h3>
              <p className="text-gray-600">Easily upload your medical reports (e.g., lab results, imaging scans).</p>
            </div>
            <div className={`p-4 rounded-lg shadow-md bg-gray-50 ${isAnimated ? 'animate-slide-in-up' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">Ask Questions</h3>
              <p className="text-gray-600">Ask specific questions or get general insights on your health.</p>
            </div>
            <div className={`p-4 rounded-lg shadow-md bg-gray-50 ${isAnimated ? 'animate-slide-in-up' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">Get Answers</h3>
              <p className="text-gray-600">Receive clear and concise answers and recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add animations here
