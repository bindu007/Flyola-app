import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Calendar, Clock, MapPin, Plane, User, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function FlightDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = id === 'new'
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    aircraft: '',
    flightNumber: '',
    chocks_on: '',
    chocks_off: '',
    FROM: '',
    To: '',
    trainee: '',
    instructor: '',
    typeOfFlight: '',
    sortieType: '',
    duration: '',
    userId: user?.id || null,
  })

  const calculateDuration = (chocksOff, chocksOn) => {
    if (!chocksOff || !chocksOn) return ''
    
    const offTime = new Date(`2000-01-01T${chocksOff}`)
    const onTime = new Date(`2000-01-01T${chocksOn}`)
    
    // Handle case where chocks_on might be next day
    if (onTime < offTime) {
      onTime.setDate(onTime.getDate() + 1)
    }
    
    const diffMs = onTime - offTime
    const diffHours = diffMs / (1000 * 60 * 60)
    
    return diffHours.toFixed(2)
  }

  useEffect(() => {
    if (!isNew && id) {
      const flights = JSON.parse(localStorage.getItem('flights') || '[]')
      const flight = flights.find(f => f.id === id)
      if (flight) {
        let flightData = {
          ...flight,
          date: flight.date ? flight.date.split('T')[0] : new Date().toISOString().split('T')[0],
        }
        // Calculate duration if chocks times are available but duration is missing
        if (flightData.chocks_off && flightData.chocks_on && !flightData.duration) {
          flightData.duration = calculateDuration(flightData.chocks_off, flightData.chocks_on)
        }
        setFormData(flightData)
      }
    }
  }, [id, isNew, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = {
      ...formData,
      [name]: value,
    }
    
    // Auto-calculate duration when chocks times change
    if ((name === 'chocks_off' || name === 'chocks_on') && updatedData.chocks_off && updatedData.chocks_on) {
      updatedData.duration = calculateDuration(updatedData.chocks_off, updatedData.chocks_on)
    }
    
    if (name === 'sortieType' && value === 'Solo') {
      updatedData.instructor = ''
    }

    setFormData(updatedData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate duration from chocks times
    let duration = formData.duration
    if (formData.chocks_off && formData.chocks_on) {
      duration = calculateDuration(formData.chocks_off, formData.chocks_on)
    }
    
    const flights = JSON.parse(localStorage.getItem('flights') || '[]')
    
    if (isNew) {
      const newFlight = {
        ...formData,
        duration,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      flights.push(newFlight)
    } else {
      const index = flights.findIndex(f => f.id === id)
      if (index !== -1) {
        flights[index] = {
          ...flights[index],
          ...formData,
          duration,
          updatedAt: new Date().toISOString(),
        }
      }
    }
    
    localStorage.setItem('flights', JSON.stringify(flights))
    navigate('/flights')
  }


  const isSoloSortie = formData.sortieType === 'Solo'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/flights"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Add New Flight' : 'Edit Flight'}
          </h1>
          <p className="text-gray-600">
            {isNew ? 'Record details of your flight' : 'Update flight information'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* CHOCKS OFF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Chocks Off
            </label>
            <input
              type="time"
              name="chocks_off"
              value={formData.chocks_off}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., 10:00"
            />
          </div>

          {/* CHOCKS ON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Chocks On
            </label>
            <input
              type="time"
              name="chocks_on"
              value={formData.chocks_on}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., 12:00"
            />
          </div>

          {/* Aircraft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Plane className="w-4 h-4 inline mr-1" />
              Aircraft
            </label>
            <input
              type="text"
              name="aircraft"
              value={formData.aircraft}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., Cessna 172"
            />
          </div>

          {/* Flight Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flight Number
            </label>
            <input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Optional"
            />
          </div>

          {/* FROM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              FROM
            </label>
            <input
              type="text"
              name="FROM"
              value={formData.FROM}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., VEKO"
            />
          </div>

          {/* TO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              TO
            </label>
            <input
              type="text"
              name="To"
              value={formData.To}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., VEKO"
            />
          </div>

          {/* Trainee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Trainee Name
            </label>
            <input
              type="text"
              name="trainee"
              value={formData.trainee}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Enter trainee name"
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Instructor (if applicable)
            </label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              disabled={isSoloSortie}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder={isSoloSortie ? 'Solo sortie selected' : 'Optional'}
            />
            {isSoloSortie && (
              <p className="text-xs text-orange-600 mt-1">
                Instructor field is disabled for solo sorties.
              </p>
            )}
          </div>

          {/* Type of Flight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Type of Flight *
            </label>
            <select
              name="typeOfFlight"
              value={formData.typeOfFlight}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Select type of flight</option>
              <option value="Ccts&Ldg">Ccts&Ldg</option>
              <option value="General Flying">General Flying</option>
              <option value="Progress Check">Progress Check</option>
              <option value="Check">Check</option>
              <option value="Cross-country">Cross-country</option>
              <option value="Instrument Flying">Instrument Flying</option>
            </select>
          </div>

          {/* Sortie Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sortie Type *
            </label>
            <select
              name="sortieType"
              value={formData.sortieType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Select sortie type</option>
              <option value="Dual">Dual</option>
              <option value="Solo">Solo</option>
            </select>
          </div>

          {/* Duration (auto-calculated) */}
          {formData.duration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (hours)
              </label>
              <input
                type="text"
                value={`${formData.duration}h`}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            to="/flights"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isNew ? 'Save Flight' : 'Update Flight'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FlightDetail


