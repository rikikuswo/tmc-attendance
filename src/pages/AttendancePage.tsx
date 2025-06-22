import { useEffect, useState } from 'react'
import axios from 'axios'
import { Scanner } from '@yudiel/react-qr-scanner'
import Swal from 'sweetalert2'
import logo from '../assets/images/tmc-logo.png'

const getDayName = (date: Date) => {
  return date.toLocaleDateString('id-ID', { weekday: 'long' })
}

const getDateString = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function AttendancePage() {
  const [allAttendees, setAllAttendees] = useState<any[]>([])
  const [scannedId, setScannedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())
  const attendeesPerPage = 10

  useEffect(() => {
    fetchAllAttendees()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchAllAttendees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/all-attendees')
      console.log('response', response)
      setAllAttendees(response.data.attendees)
    } catch (error) {
      console.error('Error fetching all attendees:', error)
    }
  }

  const markAttendance = async (id: string) => {
    setLoading(true)
    try {
      await axios.post(`http://localhost:8000/api/attend/${id}`)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kehadiran berhasil dicatat!',
        timer: 1500,
        showConfirmButton: false
      })
      fetchAllAttendees()
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: 'warning',
          title: 'Peserta sudah hadir!',
          text: 'QR Code ini sudah terdaftar hadir.',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Gagal mencatat kehadiran.',
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

  const handleError = (err: any) => {
    console.error('QR Scan Error:', err)
  }

  const totalDaftar = allAttendees.length
  const totalHadir = allAttendees.filter((a) => a.attended_at.Valid === true).length
  const totalBelumHadir = allAttendees.filter((a) => a.attended_at.Valid === false).length

  console.log('allAttendees', allAttendees)

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
          {loading && <p className="text-center mt-4 text-blue-500">Mencatat kehadiran...</p>}
        </div>

        {/* Right Side: Cards and Table */}
        <div className="flex flex-col w-full lg:w-3/4 gap-6">
          {/* Statistic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Total Hadir</p>
              <p className="text-3xl font-bold text-green-600">{totalHadir}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Belum Hadir</p>
              <p className="text-3xl font-bold text-red-600">{totalBelumHadir}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-lg font-semibold">Total Peserta</p>
              <p className="text-3xl font-bold text-blue-600">{totalDaftar}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full">
            <h2 className="text-xl font-semibold mb-4">Daftar Peserta Hadir</h2>
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Nama</th>
                  <th className="p-2 border">Perusahaan</th>
                </tr>
              </thead>
              <tbody>
                {currentAttendees.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 p-4">Belum ada yang hadir.</td>
                  </tr>
                )}
                {currentAttendees.map((attendee, index) => (
                  <tr key={attendee.id} className="hover:bg-gray-100">
                    <td className="p-2 border text-center">{indexOfFirst + index + 1}</td>
                    <td className="p-2 border">{attendee.name}</td>
                    <td className="p-2 border">{attendee.company}</td>
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