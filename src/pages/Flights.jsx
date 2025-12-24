import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Plane, Calendar, Clock, MapPin, Search, Edit, Trash2, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as XLSX from 'xlsx'

function Flights() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flights, setFlights] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

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

  // Map Excel exercise values to Type of Flight
  const mapTypeOfFlight = (exerciseValue) => {
    if (!exerciseValue) return ''
    
    const exercise = String(exerciseValue).trim()
    
    if (exercise.includes('Ccts') || exercise.includes('App') || exercise.includes('Ldgs')) {
      return 'Ccts&Ldg'
    }
    if (exercise.includes('General') || exercise.includes('Line Flying')) {
      return 'General Flying'
    }
    if (exercise.includes('Cross-country')) {
      return 'Cross-country'
    }
    if (exercise.includes('Instrument') || exercise.includes('Simulated')) {
      return 'Instrument Flying'
    }
    if (exercise.includes('CHECK') || exercise.includes('Check')) {
      return 'Check'
    }
    
    // Default fallback
    return 'General Flying'
  }

  // Calculate duration from chocks off/on times
  const calculateDuration = (chocksOff, chocksOn) => {
    if (!chocksOff || !chocksOn) return ''
    
    // Handle time formats (could be HH:MM or HH:MM:SS)
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

  // Convert Excel date to YYYY-MM-DD format
  const formatDate = (excelDate) => {
    if (!excelDate) return ''
    
    // If it's already a date string
    if (typeof excelDate === 'string') {
      // Handle dd/mm/yyyy format (from Excel)
      const ddMMyyyyMatch = excelDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (ddMMyyyyMatch) {
        const day = ddMMyyyyMatch[1].padStart(2, '0')
        const month = ddMMyyyyMatch[2].padStart(2, '0')
        const year = ddMMyyyyMatch[3]
        // Return in YYYY-MM-DD format
        return `${year}-${month}-${day}`
      }
      
      // Handle dd-mm-yyyy format
      const ddMMyyyyDashMatch = excelDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
      if (ddMMyyyyDashMatch) {
        const day = ddMMyyyyDashMatch[1].padStart(2, '0')
        const month = ddMMyyyyDashMatch[2].padStart(2, '0')
        const year = ddMMyyyyDashMatch[3]
        return `${year}-${month}-${day}`
      }
      
      // Try to parse as standard date string
      const date = new Date(excelDate)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
      
      return excelDate
    }
    
    // If it's an Excel serial date number
    if (typeof excelDate === 'number') {
      // Excel epoch starts from 1900-01-01
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + excelDate * 86400000)
      return date.toISOString().split('T')[0]
    }
    
    // If it's a Date object
    if (excelDate instanceof Date) {
      return excelDate.toISOString().split('T')[0]
    }
    
    return ''
  }

  // Convert time to HH:MM format
  const formatTime = (timeValue) => {
    if (!timeValue) return ''
    
    // If it's already a string in HH:MM format
    if (typeof timeValue === 'string') {
      // Extract HH:MM from string
      const match = timeValue.match(/(\d{1,2}):(\d{2})/)
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`
      }
      return timeValue
    }
    
    // If it's a decimal (e.g., 0.5 = 12:00)
    if (typeof timeValue === 'number') {
      const hours = Math.floor(timeValue * 24)
      const minutes = Math.floor((timeValue * 24 - hours) * 60)
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    return ''
  }

  const handleImportExcel = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImporting(true)
    setImportMessage({ type: '', text: '' })

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        setImportMessage({ type: 'error', text: 'Excel file is empty or has no data rows.' })
        setImporting(false)
        return
      }

      const allFlights = JSON.parse(localStorage.getItem('flights') || '[]')
      const importedFlights = []
      let successCount = 0
      let errorCount = 0

      jsonData.forEach((row, index) => {
        try {
          // Map columns according to the logic
          const dateOfFlight = row['Date of Flight'] || row['Date'] || row['date'] || row['DATE']
          const flightDepartureTime = row['Flight Departure Time'] || row['Chocks off'] || row['chocks_off'] || row['Departure Time']
          const flightArrivalTime = row['Flight Arrival Time'] || row['Chocks on'] || row['chocks_on'] || row['Arrival Time']
          const aircraftRegVT = row['Aircraft RegVT No'] || row['Aircraft'] || row['aircraft'] || row['AIRCRAFT']
          const flightFrom = row['Flight From'] || row['From'] || row['FROM'] || row['from']
          const flightTo = row['Flight To'] || row['To'] || row['TO'] || row['to']
          const coPilotOrStudent = row['Co. pilot or student'] || row['Co-pilot or student'] || row['Co Pilot or Student'] || row['Copilot'] || row['Student']
          const pilotInCommand = row['Pilot-in-Command'] || row['Pilot in Command'] || row['Pilot-In-Command'] || row['PIC'] || row['Instructor']
          const exercises = row['Exercises'] || row['Exercise'] || row['exercises'] || row['Type of Flight']

          // Skip if essential fields are missing
          if (!dateOfFlight || !aircraftRegVT) {
            errorCount++
            return
          }

          // Determine Trainee Name, Sortie Type, and Instructor
          let traineeName = ''
          let sortieType = ''
          let instructor = ''

          if (!coPilotOrStudent || String(coPilotOrStudent).trim() === '') {
            // If Co. pilot or student is empty
            traineeName = pilotInCommand || ''
            sortieType = 'Solo'
            instructor = ''
          } else {
            // If Pilot-in-Command has value
            traineeName = coPilotOrStudent || ''
            sortieType = 'Dual'
            instructor = pilotInCommand || ''
          }

          // Map Type of Flight
          const typeOfFlight = mapTypeOfFlight(exercises)

          // Format date
          const formattedDate = formatDate(dateOfFlight)

          // Format times
          const chocksOff = formatTime(flightDepartureTime)
          const chocksOn = formatTime(flightArrivalTime)

          // Calculate duration
          const duration = calculateDuration(chocksOff, chocksOn)

          // Create flight object
          const flight = {
            id: Date.now().toString() + index,
            date: formattedDate,
            aircraft: String(aircraftRegVT).trim(),
            flightNumber: '',
            chocks_off: chocksOff,
            chocks_on: chocksOn,
            FROM: String(flightFrom || '').trim(),
            To: String(flightTo || '').trim(),
            trainee: String(traineeName).trim(),
            instructor: String(instructor).trim(),
            typeOfFlight: typeOfFlight,
            sortieType: sortieType,
            duration: duration,
            userId: user?.id || null,
            createdAt: new Date().toISOString(),
            imported: true,
          }

          importedFlights.push(flight)
          successCount++
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error)
          errorCount++
        }
      })

      // Save imported flights to localStorage
      if (importedFlights.length > 0) {
        const updatedFlights = [...allFlights, ...importedFlights]
        localStorage.setItem('flights', JSON.stringify(updatedFlights))
        loadFlights()

        setImportMessage({
          type: 'success',
          text: `Successfully imported ${successCount} flight(s)${errorCount > 0 ? `. ${errorCount} row(s) skipped due to errors.` : '.'}`,
        })
      } else {
        setImportMessage({
          type: 'error',
          text: `No flights were imported. ${errorCount} row(s) had errors.`,
        })
      }
    } catch (error) {
      console.error('Error importing Excel file:', error)
      setImportMessage({
        type: 'error',
        text: 'Failed to import Excel file. Please check the file format and try again.',
      })
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight History</h1>
          <p className="text-gray-600">Track and manage all your flights</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Link
            to="/flights/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add New Flight
          </Link>
        </div>
      </div>

      {/* Import Message */}
      {importMessage.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            importMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="font-medium">{importMessage.text}</p>
        </div>
      )}

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




