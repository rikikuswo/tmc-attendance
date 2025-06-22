import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import logo from '../assets/images/tmc-logo.png'

function FormPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState('')
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/form', {
        name,
        company,
        status,
        period
      })

      Swal.fire({
        title: 'Berhasil!',
        text: 'Data berhasil disimpan.',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          navigate(`/detail/${response.data.id}`)
        }
      })

    } catch (error) {
      console.error('Error:', error)
      if (error.response && error.response.status === 400) {
        Swal.fire({
          title: 'Gagal!',
          text: error.response.data,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal menyimpan data.',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <img src={logo} alt="TMC" className="h-32" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">Registrasi</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <input
            type="text"
            placeholder="Nama Perusahaan"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <select
            name="status"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="" disabled>Pilih Status</option>
            <option value="Observer">Observer</option>
            <option value="Participant">Participant</option>
            <option value="Team Member">Team Member</option>
          </select>
        </div>

        <button
          type="submit"
          className={`mt-6 w-full p-3 rounded text-white font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default FormPage
