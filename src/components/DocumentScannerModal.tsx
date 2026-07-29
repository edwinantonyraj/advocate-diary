import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Image as ImageIcon, Sliders, RotateCw, FileText, Upload, Sparkles, AlertCircle, ShieldAlert, Layers } from 'lucide-react';
import { CaseDocument } from '../types';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  onSaveDocument: (doc: CaseDocument) => void;
}

type FilterMode = 'contrast' | 'bw' | 'original';

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  caseId,
  caseNumber,
  caseTitle,
  onSaveDocument,
}) => {
  if (!isOpen) return null;

  // Camera & Stream state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'error' | 'captured'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Captured Image state
  const [capturedRawData, setCapturedRawData] = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('contrast');
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Form Metadata state
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<CaseDocument['category']>('Court Order');
  const [docNotes, setDocNotes] = useState<string>('');

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setCameraState('starting');
    setErrorMessage('');

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser environment.');
      }

      // Check available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState('active');
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setCameraState('error');
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings or upload a document photo manually.'
          : err.message || 'Unable to access device camera. You can upload an image file instead.'
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleSwitchCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture frame from video onto canvas
  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedRawData(dataUrl);
    setCameraState('captured');
    setRotationAngle(0);

    // Default title suggestion
    const defaultTitle = `${docCategory} - ${new Date().toLocaleDateString('en-IN')}`;
    setDocTitle(defaultTitle);

    // Apply default document filter enhancement
    applyFilter(dataUrl, 'contrast', 0);
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedRawData(dataUrl);
      setCameraState('captured');
      setRotationAngle(0);

      const defaultTitle = `${file.name.replace(/\.[^/.]+$/, '')}`;
      setDocTitle(defaultTitle);

      applyFilter(dataUrl, 'contrast', 0);
    };
    reader.readAsDataURL(file);
  };

  // Process & Enhance Captured Image
  const applyFilter = (
    srcDataUrl: string,
    filter: FilterMode,
    angle: number
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle orientation dimensions
      const isRotated90 = angle === 90 || angle === 270;
      canvas.width = isRotated90 ? img.height : img.width;
      canvas.height = isRotated90 ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Image Enhancement Filter Matrix
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (filter === 'contrast') {
        // High Contrast Scan Enhancement (Boost contrast & sharpen text background)
        const contrastFactor = 1.35; // boost
        const brightnessOffset = 10;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Contrast adjustment formula
          r = Math.min(255, Math.max(0, (r - 128) * contrastFactor + 128 + brightnessOffset));
          g = Math.min(255, Math.max(0, (g - 128) * contrastFactor + 128 + brightnessOffset));
          b = Math.min(255, Math.max(0, (b - 128) * contrastFactor + 128 + brightnessOffset));

          // Clean light backgrounds to crisp white
          if (r > 200 && g > 200 && b > 200) {
            r = Math.min(255, r + 25);
            g = Math.min(255, g + 25);
            b = Math.min(255, b + 25);
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (filter === 'bw') {
        // High Contrast Black & White Document Mode
        for (let i = 0; i < data.length; i += 4) {
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Thresholding for clean text scan
          const bwVal = avg > 135 ? Math.min(255, avg + 50) : Math.max(0, avg - 40);
          data[i] = bwVal;
          data[i + 1] = bwVal;
          data[i + 2] = bwVal;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setProcessedDataUrl(canvas.toDataURL('image/jpeg', 0.90));
    };
    img.src = srcDataUrl;
  };

  const handleFilterChange = (newFilter: FilterMode) => {
    setFilterMode(newFilter);
    if (capturedRawData) {
      applyFilter(capturedRawData, newFilter, rotationAngle);
    }
  };

  const handleRotate = () => {
    const nextAngle = (rotationAngle + 90) % 360;
    setRotationAngle(nextAngle);
    if (capturedRawData) {
      applyFilter(capturedRawData, filterMode, nextAngle);
    }
  };

  const handleRetake = () => {
    setCapturedRawData(null);
    setProcessedDataUrl(null);
    setCameraState('active');
    startCamera(facingMode);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processedDataUrl && !capturedRawData) return;

    const newDoc: CaseDocument = {
      id: `doc-${Date.now()}`,
      caseId,
      title: docTitle.trim() || `${docCategory} Scan`,
      category: docCategory,
      dataUrl: processedDataUrl || capturedRawData!,
      capturedAt: new Date().toISOString(),
      notes: docNotes.trim() || undefined,
    };

    onSaveDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl flex flex-col shadow-2xl text-white my-auto overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-400 text-slate-950 font-black">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-white uppercase tracking-tight flex items-center gap-2">
                Document Camera Scanner
              </h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Case: <span className="text-sky-400">{caseNumber}</span> - {caseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Hidden Canvas for Image Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Workspace Body */}
        <div className="p-4 space-y-4">
          {cameraState === 'captured' ? (
            /* PREVIEW & METADATA ENTRY STAGE */
            <div className="space-y-4">
              {/* Scan Image Preview Canvas / Image */}
              <div className="relative bg-slate-950 border border-white/10 p-2 flex flex-col items-center justify-center min-h-[280px] max-h-[380px] overflow-hidden">
                <img
                  src={processedDataUrl || capturedRawData!}
                  alt="Scanned Document Preview"
                  className="max-h-[340px] w-auto object-contain shadow-lg border border-white/10"
                />

                {/* Retake & Rotate Overlay Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-950/80 p-1.5 backdrop-blur-md border border-white/20">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase flex items-center gap-1 border border-white/10"
                    title="Rotate 90 Degrees"
                  >
                    <RotateCw className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline">Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs uppercase flex items-center gap-1 border border-white/10"
                    title="Retake Document Snap"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Retake</span>
                  </button>
                </div>
              </div>

              {/* Filter Enhancement Controls */}
              <div className="bg-[#1E293B] p-3 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Scan Filter Enhancement
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Active: {filterMode === 'contrast' ? 'Magic Enhance' : filterMode === 'bw' ? 'Black & White' : 'Original Color'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('contrast')}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1 ${
                      filterMode === 'contrast'
                        ? 'bg-sky-400 text-slate-950 border-sky-400'
                        : 'bg-[#0F172A] text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Magic Color</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('bw')}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1 ${
                      filterMode === 'bw'
                        ? 'bg-sky-400 text-slate-950 border-sky-400'
                        : 'bg-[#0F172A] text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>High Contrast B&W</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('original')}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1 ${
                      filterMode === 'original'
                        ? 'bg-sky-400 text-slate-950 border-sky-400'
                        : 'bg-[#0F172A] text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Original Raw</span>
                  </button>
                </div>
              </div>

              {/* Document Metadata Form */}
              <form onSubmit={handleSave} className="space-y-3 bg-[#1E293B] p-3.5 border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">
                      Document Title / Name *
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="E.G. HIGH COURT ORDER COPY DATED 28-07-2026"
                      className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase text-xs focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">
                      Document Category
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value as CaseDocument['category'])}
                      className="w-full bg-[#0F172A] border border-white/10 p-2 text-sky-400 font-bold uppercase text-xs focus:outline-none focus:border-sky-400"
                    >
                      <option value="Court Order">Court Order / Judgment</option>
                      <option value="Petition / Plaint">Petition / Written Statement</option>
                      <option value="Vakalatnama">Vakalatnama / Memo of Appearance</option>
                      <option value="Evidence">Evidence Exhibit / Annexure</option>
                      <option value="Notice">Legal Notice / Summons</option>
                      <option value="Scanned Document">General Scanned Document</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold text-[10px] tracking-wider uppercase">
                    Notes / Page Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="E.G. Certified copy attached. Page 1 of 3."
                    className="w-full bg-[#0F172A] border border-white/10 p-2 text-white font-semibold uppercase text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider border border-white/10"
                  >
                    Discard & Retake
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Attach Scanned Document to Case</span>
                  </button>
                </div>
              </form>
            </div>
          ) : cameraState === 'error' ? (
            /* ERROR OR NO-CAMERA FALLBACK STATE */
            <div className="bg-[#1E293B] border border-rose-500/30 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-black text-rose-400 text-sm uppercase tracking-wider">Camera Unavailable</h3>
                <p className="text-xs text-slate-300 font-semibold max-w-md mx-auto mt-1">
                  {errorMessage}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 max-w-md mx-auto space-y-3">
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                  You can still capture/attach document files directly from device storage:
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Browse & Upload Document Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="text-xs text-sky-400 hover:underline uppercase font-bold tracking-wider"
                  >
                    Try Re-connecting Camera
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* LIVE CAMERA VIEW & SHUTTER STAGE */
            <div className="space-y-4">
              {/* Camera Feed Container */}
              <div className="relative bg-slate-950 border border-white/10 overflow-hidden min-h-[300px] sm:min-h-[360px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full max-h-[420px] object-cover"
                />

                {/* Viewfinder Alignment Overlay */}
                <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-sky-400/60 pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[10px] text-sky-300 font-black uppercase tracking-widest bg-slate-950/60 px-2 py-0.5 self-center backdrop-blur-sm">
                    Align Physical Document Inside Frame
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="w-4 h-4 border-l-2 border-b-2 border-sky-400" />
                    <span className="w-4 h-4 border-r-2 border-b-2 border-sky-400" />
                  </div>
                </div>

                {/* Top Camera Controls Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {hasMultipleCameras && (
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="p-2 bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md text-xs font-bold uppercase flex items-center gap-1"
                      title="Switch Front/Rear Camera"
                    >
                      <RefreshCw className="w-4 h-4 text-sky-400" />
                      <span className="hidden sm:inline">Switch Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shutter Action Bar */}
              <div className="bg-[#1E293B] p-3 border border-white/10 flex items-center justify-between gap-3">
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider border border-white/10 cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Big Shutter Button */}
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={cameraState !== 'active'}
                  className="px-6 py-3 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all scale-105"
                >
                  <Camera className="w-5 h-5 stroke-[2.5]" />
                  <span>Capture Snap</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black text-xs uppercase tracking-wider border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
