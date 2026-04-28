import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Video, Download, Loader2, UserCircle, Mic, Play, Pause, FileAudio, MonitorPlay } from 'lucide-react';
import { generateAvatarVideo } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

// Predefined avatars for quick testing
const PRESET_AVATARS = [
  { id: '1', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', label: 'Portrait 1' },
  { id: '2', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', label: 'Portrait 2' },
  { id: '3', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop', label: 'Portrait 3' },
  { id: '4', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', label: 'Portrait 4' },
];

export const AvatarVideoGenerator: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();
  
  // State
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarMimeType, setAvatarMimeType] = useState<string>('image/jpeg');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState('');
  const [script, setScript] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSelectedAvatar(ev.target.result as string);
          setAvatarMimeType(file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = async (src: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSelectedAvatar(ev.target.result as string);
          setAvatarMimeType(blob.type);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to load preset avatar", error);
    }
  };

  // Handle Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const toggleAudioPreview = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  // Handle Generation
  const handleGenerate = async () => {
    if (!selectedAvatar) {
      alert("Please provide an avatar.");
      return;
    }

    // Check for API Key Selection (Veo Requirement)
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            const confirmed = confirm("Video generation requires a paid API key. Would you like to select one now?");
            if (confirmed) {
                await window.aistudio.openSelectKey();
                // We continue after selection, but ideally we should wait or re-check
            } else {
                return;
            }
        }
    }

    // Guest Usage Check
    if (!user) {
      if (usageCount >= 1) {
        setShowAuthModal(true);
        return;
      }
      incrementUsage();
    }

    setIsProcessing(true);
    setGeneratedVideoUrl(null);
    setProgressMessage('Initializing generation...');

    try {
      // Extract base64 data
      const base64Data = selectedAvatar.split(',')[1];
      
      setProgressMessage('Generating video (this may take a few minutes)...');
      
      const videoUrl = await generateAvatarVideo(
        base64Data, 
        avatarMimeType
      );

      setGeneratedVideoUrl(videoUrl);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MonitorPlay className="text-indigo-400" />
            AI Avatar Video Creator
          </h2>
          <p className="text-slate-400 text-sm">Bring avatars to life with your voice.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Column: Inputs */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6 flex-shrink-0 overflow-y-auto custom-scrollbar pr-2">
          
          {/* 1. Avatar Selection */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <UserCircle size={16} className="text-indigo-400"/> 1. Select Avatar
            </h3>
            
            {!selectedAvatar ? (
              <div className="space-y-4">
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="h-32 border-2 border-dashed border-slate-700 bg-slate-900/30 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <Upload size={24} className="text-slate-400 group-hover:text-indigo-400 mb-2" />
                  <p className="text-xs text-slate-400">Upload Image</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">Or choose a preset:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AVATARS.map((avatar) => (
                      <button 
                        key={avatar.id}
                        onClick={() => handlePresetSelect(avatar.src)}
                        className="aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-indigo-500 transition-all"
                      >
                        <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 group">
                <img src={selectedAvatar} alt="Selected" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setSelectedAvatar(null)}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>
            )}
            <input 
              ref={avatarInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* 2. Audio Upload */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Mic size={16} className="text-indigo-400"/> 2. Upload Speech (Recommended)
            </h3>
            
            {!audioFile ? (
              <div 
                onClick={() => audioInputRef.current?.click()}
                className="h-20 border border-slate-700 bg-slate-900/30 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all"
              >
                <FileAudio size={20} className="text-slate-400" />
                <span className="text-sm text-slate-400">Click to upload audio file (MP3, WAV)</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <button 
                  onClick={toggleAudioPreview}
                  className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-colors"
                >
                  {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{audioFile.name}</p>
                  <p className="text-xs text-slate-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => {
                    setAudioFile(null);
                    setAudioUrl(null);
                  }}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X size={16} />
                </button>
                <audio ref={audioRef} src={audioUrl || ''} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
              </div>
            )}
            <input 
              ref={audioInputRef}
              type="file" 
              className="hidden" 
              accept="audio/*"
              onChange={handleAudioUpload}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing || !selectedAvatar}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} /> {progressMessage || 'Generating...'}
              </>
            ) : (
              <>
                <Video size={18} /> Generate Video
              </>
            )}
          </button>

        </div>

        {/* Right Column: Result */}
        <div className="flex-1 glass-panel rounded-2xl p-6 relative flex flex-col items-center justify-center overflow-hidden bg-slate-900/30">
           {generatedVideoUrl ? (
             <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={selectedAvatar || undefined}
                  />
                  {/* If we have audio separately and the video doesn't have it (Veo limitation), we might want to play them together. 
                      However, Veo generates video. Syncing is hard. For now, we assume the user plays the video. 
                      If the user uploaded audio, we can try to play it when video plays, but browsers block auto-play.
                  */}
                </div>
                
                <div className="flex gap-3">
                  <a 
                    href={generatedVideoUrl} 
                    download="avatar-video.mp4"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Download size={18} /> Download Video
                  </a>
                </div>
                {audioUrl && (
                    <p className="text-xs text-slate-400 mt-2">Note: The generated video is a visual preview. Play your uploaded audio alongside it.</p>
                )}
             </div>
           ) : (
             <div className="text-center space-y-4 max-w-md p-8">
               <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                 <Video size={40} className="text-indigo-400 opacity-80" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-200">Create AI Avatar Videos</h3>
                 <p className="text-slate-400 text-sm mt-2">
                   Upload an avatar and audio, and watch your character come to life.
                 </p>
               </div>
               {isProcessing && (
                 <div className="pt-4 w-full">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full animate-progress origin-left"></div>
                    </div>
                    <p className="text-xs text-indigo-300 mt-2 animate-pulse">{progressMessage}</p>
                 </div>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
