import { Link, useNavigate } from 'react-router-dom'
import { Plane, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function WelcomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-primary-600 p-6 rounded-full shadow-lg">
              <Plane className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Flyola
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Track your progress, manage your flights, and access your documents
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
            
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-primary-600 font-semibold px-8 py-4 rounded-lg border-2 border-primary-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </Link>
          </div>

          {/* Skip to Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Skip to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Plane className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Flights</h3>
              <p className="text-gray-600">Record and monitor all your flying sessions</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">View Progress</h3>
              <p className="text-gray-600">See your flying hours and achievements</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Documents</h3>
              <p className="text-gray-600">Access licenses and certificates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage


