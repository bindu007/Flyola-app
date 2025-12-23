import { useEffect, useState } from 'react'
import { Plus, FileText, Calendar, Upload, Trash2, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Documents() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'SPL',
    issueDate: '',
    expiryDate: '',
    number: '',
    issuer: '',
    notes: '',
  })

  useEffect(() => {
    loadDocuments()
  }, [user])

  const loadDocuments = () => {
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
    const userDocuments = allDocuments.filter(d => d.userId === user?.id || !d.userId)
    setDocuments(userDocuments.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
    const newDocument = {
      ...formData,
      id: Date.now().toString(),
      userId: user?.id || null,
      createdAt: new Date().toISOString(),
    }
    
    allDocuments.push(newDocument)
    localStorage.setItem('documents', JSON.stringify(allDocuments))
    
    setFormData({
      name: '',
      type: 'SPL',
      issueDate: '',
      expiryDate: '',
      number: '',
      issuer: '',
      notes: '',
    })
    setShowAddForm(false)
    loadDocuments()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
      const updatedDocuments = allDocuments.filter(d => d.id !== id)
      localStorage.setItem('documents', JSON.stringify(updatedDocuments))
      loadDocuments()
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      SPL: 'bg-blue-100 text-blue-700',
      FRTOL: 'bg-purple-100 text-purple-700',
      Medical: 'bg-red-100 text-red-700',
      Others: 'bg-gray-100 text-gray-700',
    }
    return colors[type] || colors.Others
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents & Licenses</h1>
          <p className="text-gray-600">Manage your certificates and licenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Document
        </button>
      </div>

      {/* Add Document Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Document</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., Private Pilot License"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="SPL">SPL</option>
                  <option value="FRTOL">FRTOL</option>
                  <option value="Medical">Medical</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer
                </label>
                <input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., FAA, CAA"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents added yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your licenses and certificates</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white rounded-xl shadow-md p-6 ${
                isExpired(doc.expiryDate)
                  ? 'border-2 border-red-300'
                  : isExpiringSoon(doc.expiryDate)
                  ? 'border-2 border-yellow-300'
                  : 'border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{doc.name}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                      doc.type
                    )}`}
                  >
                    {doc.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {doc.number && (
                  <div>
                    <span className="font-medium">Number:</span> {doc.number}
                  </div>
                )}
                {doc.issuer && (
                  <div>
                    <span className="font-medium">Issuer:</span> {doc.issuer}
                  </div>
                )}
                {doc.issueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Issued:</span>{' '}
                    {new Date(doc.issueDate).toLocaleDateString()}
                  </div>
                )}
                {doc.expiryDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Expires:</span>{' '}
                    <span
                      className={
                        isExpired(doc.expiryDate)
                          ? 'text-red-600 font-semibold'
                          : isExpiringSoon(doc.expiryDate)
                          ? 'text-yellow-600 font-semibold'
                          : ''
                      }
                    >
                      {new Date(doc.expiryDate).toLocaleDateString()}
                      {isExpired(doc.expiryDate) && ' (Expired)'}
                      {isExpiringSoon(doc.expiryDate) && !isExpired(doc.expiryDate) && ' (Expiring Soon)'}
                    </span>
                  </div>
                )}
              </div>

              {doc.notes && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.notes}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Documents


