import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Download, Loader2, ImageMinus, Layers } from 'lucide-react';
import { removeImageBackground } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

export const BackgroundRemover: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setProcessedImage(null); // Reset previous result
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    // Guest Usage Check
    if (!user) {
      if (usageCount >= 1) {
        setShowAuthModal(true);
        return;
      }
      incrementUsage();
    }

    setIsProcessing(true);
    try {
      // Need to strip the data:image/png;base64, prefix for the API
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));
      
      const result = await removeImageBackground(base64Data, mimeType);
      setProcessedImage(result);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || 'Failed to process image.';
      alert(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ImageMinus className="text-indigo-400" />
            Background Remover
          </h2>
          <p className="text-slate-400 text-sm">Isolate subjects with AI-powered precision.</p>
        </div>
        {selectedImage && (
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
          >
            <X size={14} /> Reset
          </button>
        )}
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col relative">
        {!selectedImage ? (
          // Upload State
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="bg-indigo-600/20 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Upload an image</h3>
            <p className="text-slate-400 text-sm mt-2 mb-6 text-center max-w-sm">
              Drag and drop your image here, or click to browse files.
              <br />
              <span className="text-slate-500 text-xs mt-1 block">Supports JPG, PNG, WEBP</span>
            </p>
            <input 
              ref={inputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleChange}
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
              Browse Files
            </button>
          </div>
        ) : (
          // Comparison State
          <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
            
            {/* Original Image */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Layers size={14} /> Original
                </span>
              </div>
              <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center p-4">
                <img 
                  src={selectedImage} 
                  alt="Original" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md" 
                />
              </div>
            </div>

            {/* Action / Arrow */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-4 py-4 lg:py-0">
              <button
                onClick={handleRemoveBackground}
                disabled={isProcessing || !!processedImage}
                className={`group relative flex items-center justify-center p-4 rounded-full transition-all duration-300 ${
                  processedImage 
                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                    : isProcessing 
                      ? 'bg-indigo-500/20 text-indigo-400 cursor-wait' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : processedImage ? (
                  <ArrowRight size={24} />
                ) : (
                  <div className="flex items-center gap-2 px-2">
                     <span className="text-sm font-medium lg:hidden">Remove BG</span>
                     <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                
                {/* Floating tooltip for desktop */}
                {!processedImage && !isProcessing && (
                  <span className="hidden lg:block absolute top-full mt-3 w-max text-xs font-medium text-slate-400 bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Process Image
                  </span>
                )}
              </button>
            </div>

            {/* Processed Image */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageMinus size={14} /> Result
                </span>
                {processedImage && (
                  <a 
                    href={processedImage} 
                    download="omni-removed-bg.png"
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download size={14} /> Save
                  </a>
                )}
              </div>
              <div 
                className={`flex-1 rounded-xl overflow-hidden relative border flex items-center justify-center p-4 transition-all duration-500 ${
                  processedImage 
                    ? 'bg-[url("https://media.istockphoto.com/id/1145618475/vector/checkered-geometric-vector-background-for-transparent-illustrations.jpg?s=612x612&w=0&k=20&c=6c-gK26i4vP_x5t-b8SjKjPzX6_b2k-a2a3_2c1d3e")] bg-repeat bg-[length:20px_20px] border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)]' 
                    : 'bg-black/20 border-white/5 border-dashed'
                }`}
              >
                {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Processed" 
                    className="max-w-full max-h-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-500" 
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    {isProcessing ? (
                       <div className="flex flex-col items-center gap-3">
                         <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                            <SparkleIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 animate-pulse" />
                         </div>
                         <p className="text-sm font-medium text-indigo-300">AI is removing background...</p>
                       </div>
                    ) : (
                      <>
                        <p className="text-sm">Processed image will appear here</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
  </svg>
);