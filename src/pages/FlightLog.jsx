import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Calendar, Clock, MapPin, Download, Plus, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function FlightLog() {
  const { user } = useAuth()
  const [flights, setFlights] = useState([])
  const [totalHours, setTotalHours] = useState(0)
  const [dualHours, setDualHours] = useState(0)
  const [soloHours, setSoloHours] = useState(0)

  useEffect(() => {
    loadFlights()
  }, [user])

  const loadFlights = () => {
    const allFlights = JSON.parse(localStorage.getItem('flights') || '[]')
    const userFlights = allFlights.filter(f => f.userId === user?.id || !f.userId)
    const sortedFlights = userFlights.sort((a, b) => new Date(a.date) - new Date(b.date))
    setFlights(sortedFlights)

    // Calculate totals
    const total = sortedFlights.reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)
    const dual = sortedFlights
      .filter(f => f.sortieType === 'Dual')
      .reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)
    const solo = sortedFlights
      .filter(f => f.sortieType === 'Solo')
      .reduce((sum, flight) => sum + (parseFloat(flight.duration) || 0), 0)

    setTotalHours(total)
    setDualHours(dual)
    setSoloHours(solo)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight Log</h1>
          <p className="text-gray-600">Complete flight logbook record</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link
            to="/flights/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Flight
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-300"
          >
            <Download className="w-5 h-5" />
            Print/Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 print:hidden">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Plane className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Flights</p>
              <p className="text-xl font-bold text-gray-900">{flights.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dual Hours</p>
              <p className="text-xl font-bold text-gray-900">{dualHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Solo Hours</p>
              <p className="text-xl font-bold text-gray-900">{soloHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Log Table */}
      {flights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flights recorded yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your flying progress by adding your first flight</p>
          <Link
            to="/flights/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add First Flight
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aircraft
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Flight #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Chocks Off
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Chocks On
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    FROM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trainee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sortie
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.map((flight, index) => (
                  <tr key={flight.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(flight.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {flight.aircraft || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.flightNumber || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.chocks_off || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.chocks_on || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {flight.duration ? `${flight.duration}h` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.FROM || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.To || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.trainee || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.instructor || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flight.typeOfFlight || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          flight.sortieType === 'Solo'
                            ? 'bg-orange-100 text-orange-800'
                            : flight.sortieType === 'Dual'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flight.sortieType || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="5" className="px-4 py-3 text-sm text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {totalHours.toFixed(1)}h
                  </td>
                  <td colSpan="6" className="px-4 py-3 text-sm text-gray-600">
                    Dual: {dualHours.toFixed(1)}h | Solo: {soloHours.toFixed(1)}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none;
          }
          body {
            background: white;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  )
}

export default FlightLog
