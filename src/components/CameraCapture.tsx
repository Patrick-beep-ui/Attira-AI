import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, RotateCcw, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CameraMode = "flatlay" | "worn" | "detail";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  mode?: CameraMode;
}

const MODE_CONFIG = {
  flatlay: {
    title: "Flat Lay Photo",
    description: "Place your item flat on a clean, contrasting background",
    instruction: "Center the item within the frame",
    guideLabel: "Item Outline",
  },
  worn: {
    title: "Worn Item Photo",
    description: "Hold the item at arm's length or wear it",
    instruction: "Hold steady and ensure good lighting",
    guideLabel: "Item Area",
  },
  detail: {
    title: "Detail Photo",
    description: "Capture close-up details like patterns, textures, or tags",
    instruction: "Get close to the detail you want to capture",
    guideLabel: "Focus Area",
  },
};

export function CameraCapture({ onCapture, onCancel, mode = "flatlay" }: CameraCaptureProps) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const config = MODE_CONFIG[mode];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasCamera(true);
      setError(null);
    } catch (err: any) {
      console.error("Camera error:", err);
      setHasCamera(false);
      
      if (err.name === "NotAllowedError") {
        console.warn("CameraCapture: Permission denied - allow in browser settings");
      } else if (err.name === "NotFoundError") {
        console.warn("CameraCapture: No camera found on device");
      } else if (window.location.protocol !== "https:" && !window.location.hostname.includes("localhost")) {
        console.warn("CameraCapture: HTTPS required on mobile - using HTTP with IP address");
      }
      
      setError("Camera access denied or not available");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("Could not capture image");
      setIsProcessing(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          const reader = new FileReader();
          reader.onload = (e) => {
            setCapturedImage(e.target?.result as string);
            setCapturedFile(file);
            stopCamera();
          };
          reader.readAsDataURL(file);
        }
        setIsProcessing(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  if (error) {
    const isHttpsIssue = error.includes("HTTPS");
    
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <Camera className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mb-2 text-body font-medium">{config.title}</h3>
        <p className="mb-4 text-body-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col bg-black camera-capture-component">
      <canvas ref={canvasRef} className="hidden" />

      {hasCamera === false ? (
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-white" />
          <p className="text-body-sm text-white/70">Checking camera access...</p>
        </div>
      ) : capturedImage ? (
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured"
            className="h-64 w-full object-contain bg-black"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="mb-3 text-center text-body-sm text-white">
              {config.instruction}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={retake}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={confirmCapture}
              >
                <Check className="mr-2 h-4 w-4" />
                Use Photo
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-64 overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            <CameraGuide mode={mode} guideLabel={config.guideLabel} />

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={onCancel}
                  className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5">
                  <Info className="h-4 w-4 text-white" />
                  <span className="text-xs text-white">{config.guideLabel}</span>
                </div>
                <div className="w-9" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
              <p className="mb-3 text-center text-body-sm text-white/90">
                {config.instruction}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <div className="h-14 w-14 rounded-full border-4 border-primary" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card p-4">
            <h3 className="mb-1 text-body font-medium">{config.title}</h3>
            <p className="text-body-sm text-muted-foreground">{config.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

interface CameraGuideProps {
  mode: CameraMode;
  guideLabel: string;
}

function CameraGuide({ mode }: CameraGuideProps) {
  if (mode === "flatlay") {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 300 240"
          className="h-full w-full max-w-[80%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="20"
            y="20"
            width="260"
            height="200"
            rx="8"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />

          <rect
            x="60"
            y="60"
            width="180"
            height="120"
            rx="4"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />

          <circle cx="40" cy="40" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="260" cy="40" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="40" cy="200" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="260" cy="200" r="3" fill="rgba(255,255,255,0.4)" />

          <path
            d="M40 20 L40 40 M40 40 L20 40"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <path
            d="M260 20 L260 40 M260 40 L280 40"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <path
            d="M40 200 L40 220 M40 200 L20 200"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <path
            d="M260 200 L260 220 M260 200 L280 200"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  if (mode === "worn") {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 200 300"
          className="h-full w-full max-h-[80%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="100"
            cy="50"
            rx="30"
            ry="35"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          <path
            d="M50 90 Q100 80 150 90 L170 150 Q100 170 30 150 Z"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />

          <path
            d="M70 150 L65 280 Q100 290 135 280 L130 150"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-40 w-40 rounded-lg border-2 border-dashed border-white/40" />
    </div>
  );
}

export default CameraCapture;
