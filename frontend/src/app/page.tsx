/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

type PredictionResult = {
  model_used: string;
  Heart_Risk: boolean;
  probabilities: number[] | null;
};

export default function HeartRiskAssessment() {
  const [age, setAge] = useState<number | "">(45);
  const [cholesterol, setCholesterol] = useState<number | "">(200);
  const [exerciseHours, setExerciseHours] = useState<number | "">(3);
  const [stressLevel, setStressLevel] = useState<number>(7);
  const [bmi, setBmi] = useState<number | "">(25);
  const [model, setModel] = useState<string>("random_forest");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setIsModalOpen(false);

    try {
      const features = [age, cholesterol, exerciseHours, stressLevel, bmi].map(
        (value) => Number(value)
      );

      // Replace with your Flask endpoint
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features, model }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data as PredictionResult);
      } else {
        setError(data.error || "An unexpected error occurred.");
      }
    } catch (err: unknown) {
      setError("An error occurred while predicting.");
    } finally {
      setLoading(false);
      setIsModalOpen(true); // Open modal after API call
    }
  };

  const formatModelName = (modelName: string): string => {
    // Properly format model names
    return modelName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const classNames = ["Low Risk", "High Risk"]; // Updated class names

  return (
    <div className='min-h-screen bg-gradient-to-r from-blue-100 to-blue-50 flex flex-col'>
      {/* Navbar */}
      <header className='bg-blue-600 text-white p-4 shadow-md'>
        <div className='container mx-auto flex justify-between items-center'>
          <h1 className='text-xl lg:text-2xl font-bold'>
            Heart Attack Risk Assessment
          </h1>
          <h2 className='text-sm lg:text-lg'>
            ADTA5340: Discovery and Learning with Big Data
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex flex-grow items-center justify-center container mx-auto p-4 lg:p-8'>
        {/* Form Section */}
        <div className='w-full lg:w-1/2 bg-white p-6 lg:p-8 rounded-xl shadow-lg lg:mr-6'>
          <h2 className='text-2xl font-semibold text-blue-600 mb-4'>
            Enter Your Details
          </h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Age (in years):
              </label>
              <input
                type='number'
                placeholder='Enter your age'
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || "")}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Cholesterol Level:
              </label>
              <input
                type='number'
                placeholder='Enter cholesterol level'
                value={cholesterol}
                onChange={(e) => setCholesterol(Number(e.target.value) || "")}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Exercise Hours Per Week:
              </label>
              <input
                type='number'
                placeholder='Enter exercise hours'
                value={exerciseHours}
                onChange={(e) => setExerciseHours(Number(e.target.value) || "")}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Stress Level (1-10):
              </label>
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                BMI:
              </label>
              <input
                type='number'
                placeholder='Enter BMI'
                value={bmi}
                onChange={(e) => setBmi(Number(e.target.value) || "")}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Choose Model:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className='mt-2 p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                <option value='random_forest'>Random Forest</option>
                <option value='logistic_regression'>Logistic Regression</option>
                <option value='svm'>SVM</option>
              </select>
            </div>
            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-2 rounded-lg shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
          </form>
        </div>

        {/* Image Section */}
        <div className='hidden lg:block w-1/2'>
          <Image
            src='/heart-attack.webp'
            alt='Heart Health Prediction'
            className='rounded-xl shadow-lg'
            layout='responsive'
            width={500}
            height={500}
            priority
          />
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 lg:p-8 shadow-lg max-w-md w-full'>
            <h2 className='text-xl font-semibold text-blue-600 mb-4'>
              {error ? "Error" : "Prediction Result"}
            </h2>
            {error ? (
              <p className='text-red-600'>{error}</p>
            ) : (
              result && (
                <div className='space-y-4'>
                  <p>
                    <strong>Model Used:</strong>{" "}
                    <span className='text-blue-700'>
                      {formatModelName(result.model_used)}
                    </span>
                  </p>
                  <p>
                    <strong>Heart Risk:</strong>{" "}
                    {result.Heart_Risk ? (
                      <span className='text-red-600 font-bold'>High Risk</span>
                    ) : (
                      <span className='text-green-600 font-bold'>Low Risk</span>
                    )}
                  </p>
                  {result.probabilities && (
                    <div>
                      <h3 className='text-lg font-semibold text-blue-600'>
                        Class Probabilities:
                      </h3>
                      <ul className='list-disc list-inside space-y-1'>
                        {result.probabilities.map((prob, index) => (
                          <li key={index}>
                            <span className='text-gray-800'>
                              {classNames[index]}:{" "}
                            </span>
                            <span className='text-blue-700 font-medium'>
                              {`${(prob * 100).toFixed(2)}%`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className='mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className='bg-blue-600 text-white py-4'>
        <div className='container mx-auto text-center'>
          <h2 className='text-lg font-bold'>Team Members</h2>
          <p>Tayouth Malla | Md Shoaib Akhter | Goutham Enukonda</p>
        </div>
      </footer>
    </div>
  );
}
