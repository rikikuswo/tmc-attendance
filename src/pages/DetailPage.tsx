import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { QRCodeSVG } from 'qrcode.react'

import background from '../assets/images/tmc-background.png'

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* Card */}
      <div
        ref={cardRef}
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '350px',
          height: '770px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          color: 'white',
          textAlign: 'center'
        }}
      >
        {/* Data Peserta */}
        <div className="text-xl mt-[250px] mb-40 space-y-2 font-semibold text-gray-400">
          <p>{data.name}</p>
          <p>{data.company}</p>
          <p>{data.status}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCodeSVG value={String(data.id)} size={240} />
        </div>

        {/* ID Peserta */}
        <div className="text-xl font-semibold text-gray-400">
            <p>{String(data.id).padStart(5, '0')}</p>
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
