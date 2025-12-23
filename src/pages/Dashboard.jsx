import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Clock, Heart, TrendingUp, Plus, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalHours: 0,
    dualHours: 0,
    soloHours: 0,
    recentFlights: [],
    medicalValidity: null,
  })

  useEffect(() => {
    // Load flights from localStorage
    const flights = JSON.parse(localStorage.getItem('flights') || '[]')
    const userFlights = flights.filter(f => f.userId === user?.id || !f.userId)
    
    const totalHours = userFlights.reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)
    
    // Calculate dual and solo hours
    const dualHours = userFlights
      .filter(f => f.sortieType === 'Dual')
      .reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)
    
    const soloHours = userFlights
      .filter(f => f.sortieType === 'Solo')
      .reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)
    
    const recentFlights = userFlights
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)

    // Load medical validity from documents
    const documents = JSON.parse(localStorage.getItem('documents') || '[]')
    const userDocuments = documents.filter(d => d.userId === user?.id || !d.userId)
    const medicalDoc = userDocuments.find(d => d.type === 'Medical' || d.type === 'medical' || d.type?.toLowerCase() === 'medical')
    
    let medicalValidity = null
    if (medicalDoc && medicalDoc.expiryDate) {
      const expiryDate = new Date(medicalDoc.expiryDate)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        medicalValidity = { status: 'expired', days: Math.abs(daysUntilExpiry), date: medicalDoc.expiryDate }
      } else if (daysUntilExpiry <= 30) {
        medicalValidity = { status: 'expiring', days: daysUntilExpiry, date: medicalDoc.expiryDate }
      } else {
        medicalValidity = { status: 'valid', days: daysUntilExpiry, date: medicalDoc.expiryDate }
      }
    }

    setStats({
      totalFlights: userFlights.length,
      totalHours: totalHours.toFixed(1),
      dualHours: dualHours.toFixed(1),
      soloHours: soloHours.toFixed(1),
      recentFlights,
      medicalValidity,
    })
  }, [user])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Cadet'}! ✈️
        </h1>
        <p className="text-gray-600">Here's your flying progress overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalFlights}</h3>
          <p className="text-gray-600 text-sm">Total Flights</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalHours}h</h3>
          <p className="text-gray-600 text-sm">Total Flight Hours</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              !stats.medicalValidity 
                ? 'bg-gray-100' 
                : stats.medicalValidity.status === 'expired' 
                ? 'bg-red-100' 
                : stats.medicalValidity.status === 'expiring'
                ? 'bg-yellow-100'
                : 'bg-green-100'
            }`}>
              <Heart className={`w-6 h-6 ${
                !stats.medicalValidity 
                  ? 'text-gray-600' 
                  : stats.medicalValidity.status === 'expired' 
                  ? 'text-red-600' 
                  : stats.medicalValidity.status === 'expiring'
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`} />
            </div>
            {stats.medicalValidity?.status === 'expired' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {stats.medicalValidity?.status === 'expiring' && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            {stats.medicalValidity?.status === 'valid' && (
              <TrendingUp className="w-5 h-5 text-green-500" />
            )}
          </div>
          {stats.medicalValidity ? (
            <>
              <h3 className={`text-2xl font-bold mb-1 ${
                stats.medicalValidity.status === 'expired' 
                  ? 'text-red-600' 
                  : stats.medicalValidity.status === 'expiring'
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}>
                {stats.medicalValidity.status === 'expired' 
                  ? 'Expired' 
                  : stats.medicalValidity.status === 'expiring'
                  ? `${stats.medicalValidity.days} days`
                  : 'Valid'}
              </h3>
              <p className="text-gray-600 text-sm">
                {stats.medicalValidity.status === 'expired' 
                  ? `Expired ${stats.medicalValidity.days} days ago`
                  : stats.medicalValidity.status === 'expiring'
                  ? 'Until expiry'
                  : 'Medical Valid'}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Expires: {new Date(stats.medicalValidity.date).toLocaleDateString()}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Not Set</h3>
              <p className="text-gray-600 text-sm">Medical Validity</p>
            </>
          )}
        </div>
      </div>

      {/* Dual and Solo Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.dualHours}h</h3>
          <p className="text-gray-600 text-sm">Dual Hours</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.soloHours}h</h3>
          <p className="text-gray-600 text-sm">Solo Hours</p>
        </div>
      </div>

      {/* Recent Flights */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Flights</h2>
          <Link
            to="/flights"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats.recentFlights.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No flights recorded yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your flying progress by adding your first flight</p>
            <Link
              to="/flights"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add First Flight
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentFlights.map((flight) => (
              <Link
                key={flight.id}
                to={`/flights/${flight.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {flight.aircraft || 'Aircraft'} - {flight.flightNumber || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(flight.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{flight.duration}h</p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/flights"
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Plane className="w-8 h-8" />
            <ArrowRight className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-2">Manage Flights</h3>
          <p className="text-primary-100">Add new flights and view your flight history</p>
        </Link>

        <Link
          to="/documents"
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <ArrowRight className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-2">Documents & Licenses</h3>
          <p className="text-green-100">Access your certificates and licenses</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard


