import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-100">Form Builder</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={
                isActive('/') 
                  ? 'nav-link-active' 
                  : 'nav-link'
              }
            >
              Home
            </Link>
            <Link
              to="/create"
              className={
                isActive('/create') 
                  ? 'nav-link-active' 
                  : 'nav-link'
              }
            >
              Create
            </Link>
            <Link
              to="/forms"
              className={
                isActive('/forms') 
                  ? 'nav-link-active' 
                  : 'nav-link'
              }
            >
              Forms
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar