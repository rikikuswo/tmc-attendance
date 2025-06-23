import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import logo from '../assets/images/tmc-logo.png'

function FormPage() {
  const API_URL = import.meta.env.VITE_API_URL

  const [name, setName] = useState('')
  const [companies, setCompanies] = useState<any[]>([]) // Data list perusahaan
  const [statuses, setStatuses] = useState<any[]>([])   // Data list status

  const [company, setCompany] = useState('')  // Yang dipilih (ID atau nama)
  const [status, setStatus] = useState('')    // Yang dipilih
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
      fetchCompanies()
      fetchStatus()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/get-companies`)
      console.log('response', response)
      setCompanies(response.data) // Jangan set ke company
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }
  
  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/get-statuses`)
      console.log('response', response)
      setStatuses(response.data) // Jangan set ke status
    } catch (error) {
      console.error('Error fetching statuses:', error)
    }
  }  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
  
    try {
      const response = await axios.post(`${API_URL}/api/form`, {
        name,
        company, // ini sudah ID perusahaan yang dipilih
        status,  // ini sudah ID status yang dipilih
        period
      })
  
      Swal.fire({
        title: 'Success!',
        text: 'Successfully submitted the form. Redirecting to detail page...',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          navigate(`/detail/${response.data.id}`)
        }
      })
  
    } catch (error: any) {
      console.error('Error:', error)
      if (error.response && error.response.status === 400) {
        Swal.fire({
          title: 'Failed!',
          text: error.response.data,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      } else {
        Swal.fire({
          title: 'Failed!',
          text: 'Failed to submit the form.',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } finally {
      setLoading(false)
    }
  }  

  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <img src={logo} alt="TMC" className="h-32" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">Registration</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <select
            name="company"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="" disabled>Company</option>
            {companies.map((company: any) => (
              <option key={company.id} value={company.company_name}>
                {company.company_name}
              </option>
            ))}
          </select>

          <select
            name="status"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="" disabled>Status</option>
            {statuses.map((status: any) => (
              <option key={status.id} value={status.status_name}>
                {status.status_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={`mt-6 w-full p-3 rounded text-white font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default FormPage
