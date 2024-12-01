from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

# Load the trained models
models = {
    'random_forest': joblib.load('random_forest_model.joblib'),
    'logistic_regression': joblib.load('logistic_regression_model.joblib'),
    'svm': joblib.load('svm_model.joblib')
}

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

@app.route('/')
def home():
    return "Heart Risk Prediction API is Running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Parse input JSON
        data = request.get_json()

        # Validate input
        if 'features' not in data or 'model' not in data:
            return jsonify({'error': 'Request must include "features" and "model" fields'}), 400

        features = np.array(data['features']).reshape(1, -1)  # Ensure 2D array
        model_name = data['model']

        # Check if model is valid
        if model_name not in models:
            return jsonify({'error': f'Invalid model. Choose from {list(models.keys())}'}), 400

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

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
