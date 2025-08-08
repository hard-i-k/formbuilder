import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ViewForms = () => {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/forms')
      setForms(response.data)
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/forms/${id}`)
        setForms(forms.filter(form => form._id !== id))
      } catch (error) {
        console.error('Error deleting form:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your forms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Your Forms</h1>
            <p className="text-gray-300">
              Manage and organize all your interactive forms
            </p>
          </div>
          <Link to="/create" className="btn-primary">
            Create New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-12">
            <div className="card max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">No forms yet</h3>
              <p className="text-gray-300 mb-6">
                Get started by creating your first interactive form
              </p>
              <Link to="/create" className="btn-primary">
                Create Your First Form
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form, index) => (
              <div 
                key={form._id} 
                className="card animate-slide-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {form.headerImage && (
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img
                      src={form.headerImage}
                      alt={form.title}
                      className="w-full h-40 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                        {form.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                        {Array.isArray(form.questions) ? form.questions.length : 0} questions
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Link
                      to={`/form/${form._id}`}
                      className="flex-1 text-center btn-primary text-sm py-2"
                    >
                      Preview
                    </Link>
                    <Link
                      to={`/create?edit=${form._id}`}
                      className="flex-1 text-center btn-secondary text-sm py-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteForm(form._id)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm font-medium"
                      title="Delete form"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {forms.length > 0 && (
          <div className="mt-16 text-center">
            <div className="card-gradient max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Ready to create more?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Build engaging forms with our powerful question types and interactive features
              </p>
              <Link to="/create" className="btn-primary">
                ➕ Create Another Form
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewForms
