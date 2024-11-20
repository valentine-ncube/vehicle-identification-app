import React, { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [image, setImage] = useState(null) //Holds the uploaded image
  const [prediction, setPrediction] = useState(null) //Holds predicion results
  const [loading, setLoading] = useState(false) //Loading state

  // Function to determine premium information
  const getInsuranceInfo = (vehicleType) => {
    const premiumInfo = {
      Suv: 'Premium starts at $300/month.',
      Truck: 'Premium starts at $400/month.',
      Sedan: 'Premium starts at $200/month.',
    }
    // Converting the tagNames to match the dictionary keys using Normalization
    const normalizedType =
      vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase()
    return premiumInfo[normalizedType] || 'No premium information available.'
  }

  //  Handling image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  // Submitting image to Azure Custom Vision
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) {
      alert('Please upload an image!')
      return
    }
    setLoading(true)
    setPrediction(null)

    // Azure Custom Vision API settings
    const apiEndpoint =
      'https://insuranceprototype-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/a70aa712-bfcd-40c3-abfc-866024c636f8/classify/iterations/Iteration2/image'
    const predictionKey =
      '4huIIf1LmJk4O19j90pXWeg1tvqJOvbn3TrtFSnA6apBbYnQCv51JQQJ99AKACYeBjFXJ3w3AAAIACOGtYtI'

    try {
      // FormData to send the image
      const formData = new FormData()
      formData.append('file', image)
      // POST request to Azure
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          'Prediction-Key': predictionKey,
          'Content-Type': 'application/octet-stream',
        },
      })
      // Extracting and displaying the top prediction
      const predictions = response.data.predictions
      const topPrediction = predictions[0]
      setPrediction({
        tagName: topPrediction.tagName,
        //probability: (topPrediction.probability * 100).toFixed(2),
      })
    } catch (error) {
      console.error('Error making prediction', error)
      alert('Something went wrong while making the prediction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Vehicle Type Identification</h1>
      <form className="form-container" onSubmit={handleSubmit}>
        <div>
          <input
            type="file"
            accept="image/*"
            className="file-input"
            onChange={handleImageUpload}
          />
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload & Predict'}
        </button>
      </form>
      {prediction && (
        <div>
          <h2>Prediction Result:</h2>
          <p>
            <strong>Type:</strong> {prediction.tagName}
          </p>
          {/* <p>
            <strong>Confidence:</strong> {prediction.probability}%
          </p> */}
          <p>
            <strong>Insurance Information:</strong>{' '}
            {getInsuranceInfo(prediction.tagName)}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
