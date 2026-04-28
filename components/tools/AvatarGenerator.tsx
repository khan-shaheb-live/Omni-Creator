import React, { useState, useRef } from 'react';
import { Upload, X, Wand2, Download, Loader2, UserCircle, RefreshCcw } from 'lucide-react';
import { generateAvatar } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

const styles = [
  { id: '3d-clay', label: '3D Clay', prompt: '3D cute clay render, soft lighting, pastel colors' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Cyberpunk 2077 style, neon lights, futuristic, high tech' },
  { id: 'anime', label: 'Anime', prompt: 'Japanese anime style, Studio Ghibli inspired, vibrant colors' },
  { id: 'pixel', label: 'Pixel Art', prompt: '16-bit retro pixel art game character' },
  { id: 'professional', label: 'Professional', prompt: 'Professional corporate headshot, linkedin profile style, high quality photography' },
  { id: 'oil-painting', label: 'Oil Painting', prompt: 'Classic oil painting, van gogh style strokes, artistic' },
  { id: 'gta', label: 'GTA Style', prompt: 'Grand Theft Auto loading screen art style' },
  { id: 'simpson', label: 'Yellow Cartoon', prompt: 'The Simpsons cartoon style, yellow skin' },
];

export const AvatarGenerator: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
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
        setGeneratedImage(null);
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

  const handleGenerate = async () => {
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
    setGeneratedImage(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));
      
      const result = await generateAvatar(base64Data, mimeType, selectedStyle.prompt);
      setGeneratedImage(result);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || 'Failed to generate avatar.';
      alert(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCircle className="text-indigo-400" />
            AI Avatar Generator
          </h2>
          <p className="text-slate-400 text-sm">Turn your selfies into unique stylized avatars.</p>
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

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
        
        {/* Left Column: Upload & Style Selection */}
        <div className="w-full lg:w-96 flex flex-col gap-6 flex-shrink-0">
          
          {/* Upload Area */}
          {!selectedImage ? (
             <div 
             className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group glass-panel ${
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
             <div className="bg-indigo-600/20 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
               <Upload size={24} className="text-indigo-400" />
             </div>
             <p className="text-slate-300 font-medium">Upload your photo</p>
             <p className="text-slate-500 text-xs mt-1">JPG, PNG, WEBP</p>
             <input 
               ref={inputRef}
               type="file" 
               className="hidden" 
               accept="image/*"
               onChange={handleChange}
             />
           </div>
          ) : (
            <div className="relative h-64 rounded-xl overflow-hidden glass-panel border border-white/10 group">
              <img src={selectedImage} alt="Source" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={handleReset} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                  Remove Photo
                </button>
              </div>
            </div>
          )}

          {/* Style Selector */}
          <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Wand2 size={16} className="text-indigo-400"/> Select Style
            </h3>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  disabled={isProcessing}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    selectedStyle.id === style.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-medium block">{style.label}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || isProcessing}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Generating...
                </>
              ) : (
                <>
                  <Wand2 size={18} /> Generate Avatar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="flex-1 glass-panel rounded-2xl p-6 relative flex flex-col items-center justify-center overflow-hidden bg-slate-900/30">
           {generatedImage ? (
             <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative max-h-[80%] max-w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={generatedImage} alt="Generated Avatar" className="w-full h-full object-contain bg-black/20" />
                </div>
                
                <div className="flex gap-3">
                  <a 
                    href={generatedImage} 
                    download={`avatar-${selectedStyle.id}.png`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Download size={18} /> Download
                  </a>
                  <button 
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10"
                  >
                    <RefreshCcw size={18} /> Regenerate
                  </button>
                </div>
             </div>
           ) : (
             <div className="text-center space-y-4 max-w-md p-8">
               <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                 <UserCircle size={40} className="text-indigo-400 opacity-80" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-200">Ready to create?</h3>
                 <p className="text-slate-400 text-sm mt-2">
                   Upload your photo, pick a style from the list, and watch the AI transform you into a character.
                 </p>
               </div>
               {isProcessing && (
                 <div className="pt-4">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full animate-progress origin-left"></div>
                    </div>
                    <p className="text-xs text-indigo-300 mt-2 animate-pulse">Designing your avatar...</p>
                 </div>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};