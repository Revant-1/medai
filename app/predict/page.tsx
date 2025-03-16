"use client"

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface FormData {
  age: number;
  gender: number;
  chestpain: number;
  restingBP: number;
  serumcholestrol: number;
  fastingbloodsugar: number;
  restingrelectro: number;
  maxheartrate: number;
  exerciseangia: number;
  oldpeak: number;
  noofmajorvessels: number;
}

interface PredictionResult {
  risk_score: number;
  probability: number;
  prediction: number;
}

const fieldLabels = {
  age: "Age",
  gender: "Gender (0: Male, 1: Female)",
  chestpain: "Chest Pain Type (0-3)",
  restingBP: "Resting Blood Pressure (mmHg)",
  serumcholestrol: "Serum Cholesterol (mg/dl)",
  fastingbloodsugar: "Fasting Blood Sugar > 120 mg/dl (1: Yes, 0: No)",
  restingrelectro: "Resting ECG Results (0: Normal, 1: Abnormal)",
  maxheartrate: "Maximum Heart Rate",
  exerciseangia: "Exercise Induced Angina (1: Yes, 0: No)",
  oldpeak: "ST Depression Induced by Exercise",
  noofmajorvessels: "Number of Major Vessels (0-3)"
};

export default function PredictPage() {
  const [formData, setFormData] = useState<FormData>({
    age: 30,
    gender: 0,
    chestpain: 3,
    restingBP: 100,
    serumcholestrol: 200,
    fastingbloodsugar: 1,
    restingrelectro: 1,
    maxheartrate: 120,
    exerciseangia: 1,
    oldpeak: 2.5,
    noofmajorvessels: 2
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Prediction error:", error);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 75) return { text: "High Risk", color: "text-red-600" };
    if (probability >= 50) return { text: "Moderate Risk", color: "text-yellow-600" };
    return { text: "Low Risk", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🩺 Cardiovascular Disease Prediction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {fieldLabels[key as keyof FormData]}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    step={key === 'oldpeak' ? '0.1' : '1'}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Get Prediction"
              )}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Results</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <p className={`text-xl font-semibold ${getRiskLevel(result.probability).color}`}>
                    {getRiskLevel(result.probability).text}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Probability of CVD</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {result.probability.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Score (Log-Odds)</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {result.risk_score.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
