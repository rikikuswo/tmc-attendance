import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";

// Convert background image to base64
const backgroundBase64 = import.meta.env.VITE_BACKGROUND_IMAGE;

function DetailPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/form/${id}`);
        console.log('response.data', response.data)
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const downloadCard = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `TMC-${data.period}-${data.name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const captureScreen = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { mediaSource: "screen" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");

        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "screenshot.png";
        link.click();

        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (err) {
      console.error("Error capturing screen:", err);
    }
  };

  if (!data) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 space-y-4">
      {/* Card */}
      <div
        ref={cardRef}
        style={{
          width: "350px",
          height: "770px",
          borderRadius: "20px",
          overflow: "hidden",
          position: "relative",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {/* Background as image */}
        <img
          src={backgroundBase64}
          alt="background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col justify-between items-center h-full p-5">
          {/* Data Peserta */}
          <div className="text-lg mt-[250px] mb-28 space-y-2 font-semibold text-gray-300">
            <p>{data.name}</p>
            <p>{data.company}</p>
            <p>{data.status}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-3">
            <QRCodeSVG value={String(data.UniqueID)} size={240} />
          </div>

          {/* ID Peserta */}
          <div className="text-xl font-semibold text-gray-300 mb-4">
            <p>{String(data.UniqueID).padStart(5, "0")}</p>
          </div>
        </div>
      </div>

      {/* Button Group */}
      <div className="flex space-x-4">
        <button
          onClick={downloadCard}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Download Card
        </button>
        <button
          onClick={captureScreen}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Capture Screen
        </button>
      </div>
    </div>
  );
}

export default DetailPage;