import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'

import logo from '../assets/images/tmc-logo.png'

function DetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/form/${id}`)
        setData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [id])

  const downloadCard = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then(canvas => {
        const link = document.createElement('a')
        link.download = `TMC-${data.period}-${data.name}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      })
    }
  }

  if (!data) return <div className="text-center mt-10">Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-pink-500 p-4">
      {/* Card */}
      <div ref={cardRef} className="bg-white rounded-3xl shadow-xl w-100 bg-blue-900 p-4 relative">
        <div className="bg-white rounded-3xl shadow-xl w-80 p-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <img src="/logo-kaizen.png" alt="Kaizen" className="h-12" />
                <img src={logo} alt="TMC" className="h-32" />
            </div>

            <hr className="border border-gray-400 mb-4" />

            {/* Data */}
            <div className="text-sm mb-4 space-y-1">
            <p><span className="font-semibold">Name:</span> {data.name}</p>
            <p><span className="font-semibold">Company:</span> {data.company}</p>
            <p><span className="font-semibold">Status:</span> {data.status}</p>
            </div>

            <div className="border-b border-dashed border-b-2 my-5 pt-5">
                <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -left-2"></div>
                <div className="absolute rounded-full w-5 h-5 bg-blue-900 -mt-2 -right-2"></div>
            </div>

            {/* Event Location */}
            <div className="text-center text-sm text-gray-600 mb-4">
            <p>Integrity Convention Center</p>
            <p>30 November 2024</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
            <QRCodeSVG value={String(data.id)} size={200} />
            </div>

            {/* Unique Code */}
            <div className="text-center bg-blue-500 text-white text-sm rounded-full py-1">
            Kode Unik : {data.id}
            </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCard}
        className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Download
      </button>
    </div>
  )
}

export default DetailPage
