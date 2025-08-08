import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Build Interactive Forms
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-8">
            Create engaging forms with drag-and-drop categorization, cloze questions, and comprehension exercises. 
            Perfect for educators and content creators.
          </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/create" className="btn-primary">
            Start Creating
          </Link>
          <Link to="/forms" className="btn-secondary">
            View Examples
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Categorization</h3>
          </div>
          <p className="text-gray-300">
            Create drag-and-drop exercises where users sort items into different categories.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Cloze Questions</h3>
          </div>
          <p className="text-gray-300">
            Build fill-in-the-blank exercises with drag-and-drop options and automatic grading.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Comprehension</h3>
          </div>
          <p className="text-gray-300">
            Create reading comprehension exercises with multiple question types and media support.
          </p>
        </div>
      </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-100 mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 mb-6">
              Join educators creating engaging learning experiences
            </p>
            <Link to="/create" className="btn-primary">
              Create Your First Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage