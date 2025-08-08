import React, { useState } from 'react'

import axios from 'axios'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://formbuilder-backend.onrender.com';

const ImageUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/forms/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.data && response.data.url) {
        onChange(response.data.url)
        setError('')
      } else {
        setError('Invalid response from server')
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 'Server error occurred'
        setError(errorMessage)
      } else if (error.request) {
        // Request was made but no response
        setError('No response from server. Check if backend is running.')
      } else {
        // Something else happened
        setError('Upload failed: ' + error.message)
      }
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    onChange('')
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded"
            className="w-full max-w-md h-48 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <label 
          htmlFor="file-upload" 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 block"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Click anywhere here to upload an image'}
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </span>
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}

export default ImageUpload
