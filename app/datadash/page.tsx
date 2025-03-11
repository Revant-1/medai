"use client"

import React, { useState, useEffect } from 'react';
import { User, Menu, Share2, Copy, Check, ArrowUpDown, ChevronDown, ChevronUp, Download, AlertTriangle } from 'lucide-react';
import Nav from '@/components/Nav';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { saveAs } from 'file-saver';

interface HealthData {
  userId: string;
  heartRate: { date: string; value: number }[];
  bloodPressure: { date: string; systolic: number; diastolic: number }[];
  cholesterol: { date: string; total: number; ldl: number; hdl: number }[];
  glucose: { date: string; value: number }[];
  weight: { date: string; value: number }[];
}

interface TestResult {
  _id: string;
  userId: string;
  testType: string;
  formData: any;
  createdAt: string;
  result: {
    score: number;
    risk: string;
  };
}

const DataDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Fetch health data and test results
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch health metrics
        const healthResponse = await fetch('/api/health-data?userId=default');
        
        if (!healthResponse.ok) {
          throw new Error(`Error fetching health data: ${healthResponse.status}`);
        }
        
        const healthData = await healthResponse.json();
        
        if (healthData.success) {
          setHealthData(healthData.data);
        }
        
        // Fetch test results
        const testsResponse = await fetch('/api/get-test-data?userId=default');
        
        if (!testsResponse.ok) {
          throw new Error(`Error fetching test data: ${testsResponse.status}`);
        }
        
        const testsData = await testsResponse.json();
        
        if (testsData.success) {
          setTestResults(testsData.tests);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    if (!healthData) return null;
    
    const heartRates = healthData.heartRate.map(item => item.value);
    const systolicValues = healthData.bloodPressure.map(item => item.systolic);
    const diastolicValues = healthData.bloodPressure.map(item => item.diastolic);
    const totalCholesterol = healthData.cholesterol.map(item => item.total);
    const glucoseValues = healthData.glucose.map(item => item.value);
    const weightValues = healthData.weight.map(item => item.value);
    
    const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const min = (arr: number[]) => Math.min(...arr);
    const max = (arr: number[]) => Math.max(...arr);
    
    return {
      heartRate: {
        avg: average(heartRates).toFixed(1),
        min: min(heartRates),
        max: max(heartRates)
      },
      bloodPressure: {
        avgSystolic: average(systolicValues).toFixed(1),
        avgDiastolic: average(diastolicValues).toFixed(1),
        minSystolic: min(systolicValues),
        maxSystolic: max(systolicValues),
        minDiastolic: min(diastolicValues),
        maxDiastolic: max(diastolicValues)
      },
      cholesterol: {
        avg: average(totalCholesterol).toFixed(1),
        min: min(totalCholesterol),
        max: max(totalCholesterol)
      },
      glucose: {
        avg: average(glucoseValues).toFixed(1),
        min: min(glucoseValues),
        max: max(glucoseValues)
      },
      weight: {
        avg: average(weightValues).toFixed(1),
        min: min(weightValues).toFixed(1),
        max: max(weightValues).toFixed(1)
      }
    };
  };

  const stats = calculateStats();

  // Handle form link sharing
  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/predictionTest-1`;
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/predictionTest-1`;
    
    if (navigator.share) {
      navigator.share({
        title: 'MediSage Heart Health Assessment',
        text: 'Take this heart health assessment to check your cardiovascular health.',
        url: formUrl,
      })
      .then(() => setShared(true))
      .catch(console.error);
      
      setTimeout(() => setShared(false), 2000);
    } else {
      handleCopyLink();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get test type display name
  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case 'heart-test-1':
        return 'Heart Health Assessment 1';
      case 'heart-test-2':
        return 'Heart Health Assessment 2';
      default:
        return testType;
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    if (!testResults.length) return;

    const headers = ['Test Type', 'Date', 'Score', 'Risk'];
    const csvContent = [
      headers.join(','),
      ...testResults.map(test => [
        getTestTypeName(test.testType),
        formatDate(test.createdAt),
        test.result.score,
        test.result.risk
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'test_results.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 pl-16 lg:pl-0">Health Data Dashboard</h1>
              <p className="text-gray-600 pl-16 lg:pl-0 mb-4">
                Track and analyze your health metrics over time
              </p>
              
              {/* Assessment Form Buttons */}
              <div className="flex flex-wrap gap-3 mb-6 pl-16 lg:pl-0">
                <Link href="/predictionTest-1">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Heart Test 1
                  </button>
                </Link>
                <Link href="/predictionTest-2">
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Heart Test 2
                  </button>
                </Link>
                <button 
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Form Link'}
                </button>
                <button 
                  onClick={handleShareLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {shared ? 'Shared!' : 'Share Form'}
                </button>
                <button 
                  onClick={exportCSV}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <Link href="/other-tests">
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">Other Tests</button>
                </Link>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b mb-6 pl-16 lg:pl-0">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'overview' 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'charts' 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('charts')}
                >
                  Charts
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'table' 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('table')}
                >
                  Data Table
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Heart Rate Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-4">Heart Rate</h3>
                      <div className="flex justify-between mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Average</p>
                          <p className="text-2xl font-bold text-green-600">{stats?.heartRate.avg} <span className="text-sm font-normal">bpm</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Min</p>
                          <p className="text-2xl font-bold text-blue-600">{stats?.heartRate.min} <span className="text-sm font-normal">bpm</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Max</p>
                          <p className="text-2xl font-bold text-red-600">{stats?.heartRate.max} <span className="text-sm font-normal">bpm</span></p>
                        </div>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData?.heartRate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Blood Pressure Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-4">Blood Pressure</h3>
                      <div className="flex justify-between mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Average</p>
                          <p className="text-2xl font-bold text-green-600">
                            {stats?.bloodPressure.avgSystolic}/{stats?.bloodPressure.avgDiastolic}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Min</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {stats?.bloodPressure.minSystolic}/{stats?.bloodPressure.minDiastolic}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Max</p>
                          <p className="text-2xl font-bold text-red-600">
                            {stats?.bloodPressure.maxSystolic}/{stats?.bloodPressure.maxDiastolic}
                          </p>
                        </div>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData?.bloodPressure}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Cholesterol Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-4">Cholesterol</h3>
                      <div className="flex justify-between mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Average</p>
                          <p className="text-2xl font-bold text-green-600">{stats?.cholesterol.avg} <span className="text-sm font-normal">mg/dL</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Min</p>
                          <p className="text-2xl font-bold text-blue-600">{stats?.cholesterol.min} <span className="text-sm font-normal">mg/dL</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Max</p>
                          <p className="text-2xl font-bold text-red-600">{stats?.cholesterol.max} <span className="text-sm font-normal">mg/dL</span></p>
                        </div>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData?.cholesterol}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total Cholesterol" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;