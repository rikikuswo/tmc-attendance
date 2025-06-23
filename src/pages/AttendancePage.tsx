import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Scanner } from '@yudiel/react-qr-scanner'
import Swal from 'sweetalert2'
import logo from '../assets/images/tmc-logo.png'

const getDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

const getDateString = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function AttendancePage() {
  const API_URL = import.meta.env.VITE_API_URL

  const [allAttendees, setAllAttendees] = useState<any[]>([])
  const [scannedId, setScannedId] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())
  const attendeesPerPage = 10
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAllAttendees()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const keepFocus = setInterval(() => {
      inputRef.current?.focus()
    }, 500) // refresh focus setiap 0.5 detik
  
    return () => clearInterval(keepFocus)
  }, [])

  const fetchAllAttendees = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/all-attendees`)
      setAllAttendees(response.data.attendees)
    } catch (error) {
      console.error('Error fetching all attendees:', error)
    }
  }

  const markAttendance = async (id: string) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/attend/${id}`)
      const attendee = allAttendees.find(a => a.UniqueID === id)

      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        html: `<b>${attendee ? attendee.name : ''}</b><br>${attendee ? attendee.company : ''}<br>${attendee ? attendee.status : ''}`,
        timer: 2000,
        showConfirmButton: false
      })

      fetchAllAttendees()
      setScannedId('')
      setManualInput('')
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: 'warning',
          title: 'Already Attended!',
          text: 'This QR Code has already been registered.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          setScannedId('')
          setManualInput('')
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Not Registered!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          setScannedId('')
          setManualInput('')
        })
      }
      console.error('Error updating attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue && result[0]?.rawValue !== scannedId) {
      const scanned = result[0].rawValue
      setScannedId(scanned)
      markAttendance(scanned)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim() !== '') {
      markAttendance(manualInput.trim())
    }
  }

  const handleError = (err: any) => {
    console.error('QR Scan Error:', err)
  }

  const totalDaftar = allAttendees.length
  const totalHadir = allAttendees.filter((a) => a.attended_at.Valid === true).length
  const totalBelumHadir = allAttendees.filter((a) => a.attended_at.Valid === false).length

  const attendees = allAttendees.filter((a) => a.attended_at.Valid === true)
  const indexOfLast = currentPage * attendeesPerPage
  const indexOfFirst = indexOfLast - attendeesPerPage
  const currentAttendees = attendees.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(attendees.length / attendeesPerPage)

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="TMC Logo" className="h-24" />
        </div>
        <h1 className="text-4xl font-bold text-gray-600">Attendance</h1>
        <div className="text-right text-gray-700">
          <p className="font-semibold">{getDayName(currentTime)}, {getDateString(currentTime)}</p>
          <p className="text-4xl font-bold">
            {currentTime.getHours().toString().padStart(2, '0')}:
            {currentTime.getMinutes().toString().padStart(2, '0')}:
            {currentTime.getSeconds().toString().padStart(2, '0')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR Scanner Section */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
          <div className="w-full h-full">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
            />
          </div>

          {/* Manual Input for QR Scanner Device */}
          <form onSubmit={handleManualSubmit} className="w-full mt-4">
            <input
              type="text"
              placeholder="Scan or Enter QR Code"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              ref={inputRef} 
            />
            <button
              type="submit"
              className="mt-4 w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Recording Attendance...' : 'Submit'}
            </button>
          </form>

          {loading && <p className="text-center mt-4 text-blue-500">Recording Attendance...</p>}
        </div>

        {/* Right Side: Cards and Table */}
        <div className="flex flex-col w-full lg:w-3/4 gap-6">
          {/* Statistic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Attended</p>
              <p className="text-3xl font-bold text-green-600">{totalHadir}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Not Attended</p>
              <p className="text-3xl font-bold text-red-600">{totalBelumHadir}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Total Registered</p>
              <p className="text-3xl font-bold text-blue-600">{totalDaftar}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full">
            <h2 className="text-xl font-semibold mb-4">Attended List</h2>
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentAttendees.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 p-4">No attendees found.</td>
                  </tr>
                )}
                {currentAttendees.map((attendee, index) => (
                  <tr key={attendee.id} className="hover:bg-gray-100">
                    <td className="p-2 border text-center">{indexOfFirst + index + 1}</td>
                    <td className="p-2 border text-center">{attendee.name}</td>
                    <td className="p-2 border text-center">{attendee.company}</td>
                    <td className="p-2 border text-center">{attendee.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage