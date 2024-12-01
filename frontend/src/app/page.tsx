/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent } from "react";
import axios from "axios";

// Define types for API response and form state
type PredictionResult = {
  model_used: string;
  Heart_Risk: boolean;
  probabilities: number[] | null;
};

type ErrorResponse = {
  error: string;
};

export default function HeartRiskPrediction() {
  // Form states
  const [age, setAge] = useState<number | "">("");
  const [cholesterol, setCholesterol] = useState<number | "">("");
  const [exerciseHours, setExerciseHours] = useState<number | "">("");
  const [stressLevel, setStressLevel] = useState<number>(5); // Default stress level
  const [bmi, setBmi] = useState<number | "">("");
  const [model, setModel] = useState<string>("random_forest");

  // Prediction result states
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Define class names
  const classNames = ["Low Risk", "High Risk"];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare features array
      const features = [age, cholesterol, exerciseHours, stressLevel, bmi].map(
        (value) => Number(value)
      );

      const response = await axios.post<PredictionResult | ErrorResponse>(
        "http://127.0.0.1:5000/predict",
        {
          features,
          model,
        }
      );

      if ("error" in response.data) {
        setError(response.data.error);
      } else {
        setResult(response.data as PredictionResult);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Heart Risk Prediction</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Age (in years):
          <input
            type='number'
            value={age}
            onChange={(e) => setAge(Number(e.target.value) || "")}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </label>
        <label>
          Cholesterol Level:
          <input
            type='number'
            value={cholesterol}
            onChange={(e) => setCholesterol(Number(e.target.value) || "")}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </label>
        <label>
          Exercise Hours Per Week:
          <input
            type='number'
            value={exerciseHours}
            onChange={(e) => setExerciseHours(Number(e.target.value) || "")}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </label>
        <label>
          Stress Level (1-10):
          <select
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          BMI:
          <input
            type='number'
            value={bmi}
            onChange={(e) => setBmi(Number(e.target.value) || "")}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          />
        </label>
        <label>
          Choose Model:
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "block",
            }}
          >
            <option value='random_forest'>Random Forest</option>
            <option value='logistic_regression'>Logistic Regression</option>
            <option value='svm'>SVM</option>
          </select>
        </label>
        <button
          type='submit'
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div>
          <h2>Prediction Result:</h2>
          <p>
            <strong>Model Used:</strong>{" "}
            {result.model_used
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </p>
          <p>
            <strong>Heart Risk:</strong>{" "}
            {result.Heart_Risk ? (
              <span style={{ color: "red" }}>Yes (High Risk)</span>
            ) : (
              <span style={{ color: "green" }}>No (Low Risk)</span>
            )}
          </p>
          {result.probabilities && (
            <div>
              <h3>Class Probabilities:</h3>
              <ul>
                {result.probabilities.map((prob, index) => (
                  <li key={index}>
                    {classNames[index]}: {`${(prob * 100).toFixed(2)}%`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
