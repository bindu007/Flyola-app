import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Plane, Calendar, Clock, MapPin, Search, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Flights() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flights, setFlights] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadFlights()
  }, [user])

  const loadFlights = () => {
    const allFlights = JSON.parse(localStorage.getItem('flights') || '[]')
    const userFlights = allFlights.filter(f => f.userId === user?.id || !f.userId)
    setFlights(userFlights.sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      const allFlights = JSON.parse(localStorage.getItem('flights') || '[]')
      const updatedFlights = allFlights.filter(f => f.id !== id)
      localStorage.setItem('flights', JSON.stringify(updatedFlights))
      loadFlights()
    }
  }

  const filteredFlights = flights.filter(flight => {
    const searchLower = searchTerm.toLowerCase()
    return (
      flight.aircraft?.toLowerCase().includes(searchLower) ||
      flight.flightNumber?.toLowerCase().includes(searchLower) ||
      flight.location?.toLowerCase().includes(searchLower) ||
      flight.notes?.toLowerCase().includes(searchLower)
    )
  })

  const totalHours = flights.reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight History</h1>
          <p className="text-gray-600">Track and manage all your flights</p>
        </div>
        <Link
          to="/flights/new"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add New Flight
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Plane className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Flights</p>
              <p className="text-2xl font-bold text-gray-900">{flights.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {flights.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flights by aircraft, location, or notes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      )}

      {/* Flights List */}
      {filteredFlights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No flights found' : 'No flights recorded yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start tracking your flying progress by adding your first flight'}
          </p>
          {!searchTerm && (
            <Link
              to="/flights/new"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add First Flight
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {flight.aircraft || 'Aircraft'}
                    </h3>
                    {flight.flightNumber && (
                      <span className="text-sm text-gray-500">#{flight.flightNumber}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(flight.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {flight.duration}h duration
                    </div>
                    {flight.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {flight.location}
                      </div>
                    )}
                  </div>
                  {flight.notes && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{flight.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/flights/${flight.id}`}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(flight.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Flights




