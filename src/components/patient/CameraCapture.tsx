import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please allow permissions.');
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoData(dataUrl);
      }
    }
  };

  const retryPhoto = () => {
    setPhotoData(null);
  };

  const confirmPhoto = () => {
    if (photoData) {
      onCapture(photoData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg overflow-hidden flex flex-col p-6 space-y-6 relative">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-white">Update <span className="font-bold">Profile Photo</span></h2>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
        </div>

        <div className="relative aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
            {error && <p className="text-red-400 p-4 text-center">{error}</p>}
            
            {!photoData && !error && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            )}
            
            {photoData && (
               <img src={photoData} alt="Captured preview" className="w-full h-full object-cover" />
            )}
            
            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-4">
            {!photoData ? (
                <button 
                  onClick={capturePhoto}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3"
                >
                  <Camera size={24} /> Take Photo
                </button>
            ) : (
                <>
                  <button 
                    onClick={retryPhoto}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={20} /> Retake
                  </button>
                  <button 
                    onClick={confirmPhoto}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Check size={20} /> Use Photo
                  </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
