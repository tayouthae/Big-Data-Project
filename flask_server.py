from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load the trained models
models = {
    'random_forest': joblib.load('random_forest_model.joblib'),
    'logistic_regression': joblib.load('logistic_regression_model.joblib'),
    'svm': joblib.load('svm_model.joblib')
}

# Model metadata (for validation and frontend info)
MODEL_DETAILS = {
    'random_forest': {"description": "Random Forest Model", "expected_features": 5},
    'logistic_regression': {"description": "Logistic Regression Model", "expected_features": 5},
    'svm': {"description": "Support Vector Machine Model", "expected_features": 5}
}

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

@app.route('/')
def home():
    return "Heart Risk Prediction API is Running!"

@app.route('/models', methods=['GET'])
def models_info():
    """
    Endpoint to list available models and their details.
    """
    return jsonify(MODEL_DETAILS)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict heart risk based on the selected model and input features.
    """
    try:
        # Parse input JSON
        data = request.get_json()
        logging.info("Prediction request received: %s", data)

        # Validate input
        if 'features' not in data or 'model' not in data:
            return jsonify({'error': 'Request must include "features" and "model" fields'}), 400

        features = np.array(data['features']).reshape(1, -1)  # Ensure 2D array
        model_name = data['model']

        # Check if model is valid
        if model_name not in models:
            return jsonify({'error': f'Invalid model. Choose from {list(models.keys())}'}), 400

        # Validate feature length
        expected_features = MODEL_DETAILS[model_name]["expected_features"]
        if features.shape[1] != expected_features:
            return jsonify({'error': f'Expected {expected_features} features, but got {features.shape[1]}'}), 400

        # Validate feature types
        if not np.issubdtype(features.dtype, np.number):
            return jsonify({'error': 'All features must be numerical'}), 400

        # Select model and make prediction
        model = models[model_name]
        prediction = model.predict(features)[0]

        # Convert prediction to boolean (true/false)
        heart_risk = bool(prediction)

        # Get probabilities if supported by the model
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)[0].tolist()
        else:
            probabilities = None  # Some models like SVM may not support probabilities

        # Return result
        return jsonify({
            'model_used': model_name,
            'Heart_Risk': heart_risk,
            'probabilities': probabilities
        })

    except ValueError as ve:
        logging.error("ValueError: %s", ve)
        return jsonify({'error': f'Value error: {str(ve)}'}), 400
    except Exception as e:
        logging.error("Unexpected error: %s", e)
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
