"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestReport() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const testType = searchParams.get('testType');
    const formData = JSON.parse(searchParams.get('formData') || '{}');
    const prediction = JSON.parse(searchParams.get('prediction') || '{}');

    setReportData({ name, testType, formData, prediction });
  }, [searchParams]);

  if (!reportData) return null;

  const getRiskLevel = (probability: number) => {
    if (probability >= 75) return { text: "High Risk", color: "text-red-600" };
    if (probability >= 50) return { text: "Moderate Risk", color: "text-yellow-600" };
    return { text: "Low Risk", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-green-600 text-white">
            <h3 className="text-lg leading-6 font-medium">
              Heart Health Assessment Report
            </h3>
            <p className="mt-1 max-w-2xl text-sm">
              Test Type: {reportData.testType === 'test-1' ? 'XGBoost Model' : 'Random Forest Model'}
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{reportData.name}</dd>
                  </div>
                  {/* Add other form data fields here */}
                </dl>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Prediction Results</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Risk Level</p>
                      <p className={`text-xl font-semibold ${getRiskLevel(reportData.prediction.probability).color}`}>
                        {getRiskLevel(reportData.prediction.probability).text}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Probability of CVD</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {reportData.prediction.probability.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {reportData.prediction.risk_score.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end space-x-3">
            <Link href="/datadash">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 