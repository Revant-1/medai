"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TestReportProps {
  data: {
    name: string;
    testType: string;
    formData: any;
    prediction: {
      risk_score: number;
      probability: number;
    };
  };
  onClose: () => void;
}

const TestReport: React.FC<TestReportProps> = ({ data, onClose }) => {
  const getRiskLevel = (probability: number) => {
    if (probability >= 75) return { text: "High Risk", color: "text-red-600 bg-red-50" };
    if (probability >= 50) return { text: "Moderate Risk", color: "text-yellow-600 bg-yellow-50" };
    return { text: "Low Risk", color: "text-green-600 bg-green-50" };
  };

  const riskLevel = getRiskLevel(data.prediction.probability);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-green-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">Heart Health Assessment Report</h2>
          <p className="text-sm opacity-90">
            {data.testType === 'test-1' ? 'XGBoost Model Analysis' : 'Random Forest Model Analysis'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{data.formData.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{data.formData.gender === '0' ? 'Male' : 'Female'}</p>
              </div>
            </div>
          </div>

          {/* Prediction Results */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Prediction Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${riskLevel.color}`}>
                <p className="text-sm opacity-75">Risk Level</p>
                <p className="text-xl font-bold">{riskLevel.text}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                <p className="text-sm opacity-75">Probability of CVD</p>
                <p className="text-xl font-bold">{data.prediction.probability.toFixed(2)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 text-purple-600">
                <p className="text-sm opacity-75">Risk Score</p>
                <p className="text-xl font-bold">{data.prediction.risk_score.toFixed(3)}</p>
              </div>
            </div>
          </div>

          {/* Medical Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Medical Parameters</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {Object.entries(data.formData)
                .filter(([key]) => key !== 'name')
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="border-t p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TestReport; 