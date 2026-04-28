import React, { useState, useEffect } from 'react';
import { Send, Copy, Sparkles, Loader2, Save, Plus, Trash2, History, FolderOpen, Facebook, Instagram, Twitter, Youtube, Video, MapPin, Users, User, Search, Brain, BarChart, Hash, Image as ImageIcon } from 'lucide-react';
import { generateContentStrategy, generateThumbnail } from '../../services/geminiService';
import { Project, ToolType, Platform, ContentStrategyResult } from '../../types';
import { getProjects, saveProject, deleteProject } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

export const ContentArchitect: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();

  // Form State
  const [idea, setIdea] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('All');
  const [location, setLocation] = useState('');
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Facebook', 'Instagram']);
  const [result, setResult] = useState<ContentStrategyResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showProjects, setShowProjects] = useState(true);

  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setShowProjects(false);
    }
  }, [user]);

  const loadProjects = () => {
    if (user) {
      setProjects(getProjects(ToolType.CONTENT_ARCHITECT, user.id));
    }
  };

  const handleNewProject = () => {
    setCurrentProjectId(null);
    setIdea('');
    setAudienceDesc('');
    setAge('');
    setGender('All');
    setLocation('');
    setSelectedPlatforms(['Facebook', 'Instagram']);
    setResult(null);
    setGeneratedImage(null);
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSaveProject = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!idea) return;

    const projectId = currentProjectId || crypto.randomUUID();
    const projectName = idea.slice(0, 30) + (idea.length > 30 ? '...' : '');

    const newProject: Project = {
      id: projectId,
      userId: user.id,
      type: ToolType.CONTENT_ARCHITECT,
      name: projectName,
      lastModified: Date.now(),
      data: {
        idea,
        targetAudience: audienceDesc,
        audienceDetails: { age, gender, location },
        selectedPlatforms,
        strategyResult: result || undefined,
        generatedImageUrl: generatedImage || undefined
      }
    };

    saveProject(newProject);
    setCurrentProjectId(projectId);
    loadProjects();
    alert('Project saved successfully!');
  };

  const handleLoadProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setIdea(project.data.idea || '');
    setAudienceDesc(project.data.targetAudience || '');
    
    if (project.data.audienceDetails) {
      setAge(project.data.audienceDetails.age || '');
      setGender(project.data.audienceDetails.gender || 'All');
      setLocation(project.data.audienceDetails.location || '');
    }
    
    if (project.data.selectedPlatforms?.length) {
      setSelectedPlatforms(project.data.selectedPlatforms);
    }

    if (project.data.strategyResult) {
       if (typeof project.data.strategyResult === 'string') {
          setResult(null); 
       } else {
          setResult(project.data.strategyResult);
       }
    } else {
       setResult(null);
    }
    
    setGeneratedImage(project.data.generatedImageUrl || null);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
      if (currentProjectId === id) {
        handleNewProject();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !audienceDesc || selectedPlatforms.length === 0) return;

    // Guest Usage Check
    if (!user) {
      if (usageCount >= 1) {
        setShowAuthModal(true);
        return;
      }
      incrementUsage();
    }

    setIsLoading(true);
    setResult(null);
    setGeneratedImage(null);

    try {
      // 1. Generate Strategy (Text)
      const strategyResponse = await generateContentStrategy({ 
        idea, 
        audience: { description: audienceDesc, age, gender, location },
        platforms: selectedPlatforms
      });
      
      setResult(strategyResponse);

      // 2. Generate Thumbnail (Image)
      if (strategyResponse?.platforms?.length > 0) {
        setIsImageLoading(true);
        const thumbPrompt = strategyResponse.platforms[0].thumbnailDescription;
        if (thumbPrompt) {
           generateThumbnail(thumbPrompt).then(imageBase64 => {
             if (imageBase64) setGeneratedImage(imageBase64);
           }).catch(err => console.error("Thumbnail failed in background", err))
             .finally(() => setIsImageLoading(false));
        } else {
           setIsImageLoading(false);
        }
      }

    } catch (error) {
      console.error(error);
      alert('Generation failed. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const availablePlatforms: { id: Platform; icon: React.ReactNode; color: string }[] = [
    { id: 'Facebook', icon: <Facebook size={16} />, color: 'bg-blue-600' },
    { id: 'Instagram', icon: <Instagram size={16} />, color: 'bg-pink-600' },
    { id: 'X (Twitter)', icon: <Twitter size={16} />, color: 'bg-slate-700' },
    { id: 'YouTube', icon: <Youtube size={16} />, color: 'bg-red-600' },
    { id: 'TikTok', icon: <Video size={16} />, color: 'bg-black' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Project Sidebar - Only visible if logged in */}
      <div className={`${showProjects && user ? 'w-full lg:w-72' : 'hidden lg:block lg:w-0 lg:overflow-hidden'} transition-all duration-300 flex-shrink-0 flex flex-col gap-4`}>
        <div className="flex items-center justify-between lg:hidden mb-2">
           <h3 className="font-semibold text-slate-300">My Projects</h3>
           <button onClick={() => setShowProjects(false)} className="text-slate-400">Hide</button>
        </div>

        <button 
          onClick={handleNewProject}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
        >
          <Plus size={18} /> New Project
        </button>

        <div className="glass-panel flex-1 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <FolderOpen size={16} className="text-indigo-400" />
              Saved Strategies
            </h3>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
            {projects.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-xs">
                No saved projects yet.
              </div>
            ) : (
              projects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleLoadProject(p)}
                  className={`p-3 rounded-lg cursor-pointer group flex items-start justify-between gap-2 border transition-all ${currentProjectId === p.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                >
                  <div className="min-w-0">
                    <h4 className={`text-sm font-medium truncate ${currentProjectId === p.id ? 'text-indigo-200' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      {p.name || 'Untitled'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(p.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 h-full overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-2xl font-bold text-white tracking-tight">Content Architect</h2>
             <p className="text-slate-400 text-sm">Deep analysis and multi-platform content generation.</p>
           </div>
           <div className="flex gap-2">
             {user && (
               <button 
                 onClick={() => setShowProjects(!showProjects)}
                 className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"
               >
                 <History size={20} />
               </button>
             )}
             <button
               onClick={handleSaveProject}
               disabled={!idea}
               className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Save size={16} /> {user ? 'Save' : 'Login to Save'}
             </button>
           </div>
        </div>

        <div className={`grid grid-cols-1 ${user && showProjects ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-6 flex-1 min-h-0`}>
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="glass-panel p-6 rounded-2xl shadow-xl flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. Core Idea */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Core Content Idea
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g., Unboxing a new smart watch and testing its waterproof features..."
                    className="w-full h-24 px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-600 text-sm"
                    required
                  />
                </div>

                {/* 2. Platforms */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePlatforms.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                          selectedPlatforms.includes(p.id)
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {p.icon}
                        {p.id}
                      </button>
                    ))}
                  </div>
                  {selectedPlatforms.length === 0 && <p className="text-xs text-red-400 mt-1">Select at least one platform</p>}
                </div>

                <div className="h-px bg-white/10"></div>

                {/* 3. Detailed Audience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target Audience Niche
                  </label>
                  <textarea
                    value={audienceDesc}
                    onChange={(e) => setAudienceDesc(e.target.value)}
                    placeholder="e.g., Tech enthusiasts who love outdoor sports..."
                    className="w-full h-20 px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-600 text-sm mb-3"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Users size={12}/> Age Range
                      </label>
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g., 18-34"
                        className="w-full px-3 py-2 rounded-lg glass-input text-sm placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                         <User size={12}/> Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-sm bg-black/20 text-slate-200"
                      >
                        <option value="All" className="bg-slate-800">All</option>
                        <option value="Male" className="bg-slate-800">Male</option>
                        <option value="Female" className="bg-slate-800">Female</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <MapPin size={12}/> Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., USA & Europe, or Global"
                        className="w-full px-3 py-2 rounded-lg glass-input text-sm placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !idea || !audienceDesc || selectedPlatforms.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-400/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Analyzing & Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate Strategy</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2 flex flex-col min-h-[500px]">
            {result && result.analysis ? (
              <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full pr-2">
                {/* ... existing output rendering code ... */}
                {/* 1. Deep Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-indigo-500">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                      <Brain size={18} className="text-indigo-400" /> Idea Potential
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{result.analysis.ideaScore || "Analysis pending..."}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                      <Search size={18} className="text-emerald-400" /> SEO Strategy
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{result.analysis.seoAnalysis || "Analysis pending..."}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                      <BarChart size={18} className="text-purple-400" /> Niche Fit
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{result.analysis.nicheFit || "Analysis pending..."}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-pink-500">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                      <Users size={18} className="text-pink-400" /> Audience Behavior
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{result.analysis.audienceBehavior || "Analysis pending..."}</p>
                  </div>
                </div>

                {/* 2. Generated Thumbnail */}
                <div className="glass-panel rounded-2xl p-1 overflow-hidden">
                  <div className="bg-black/40 rounded-xl relative min-h-[250px] flex items-center justify-center">
                    {generatedImage ? (
                       <img src={generatedImage} alt="AI Generated Thumbnail" className="w-full h-auto object-cover rounded-xl" />
                    ) : isImageLoading ? (
                      <div className="text-center">
                         <Loader2 className="animate-spin mx-auto text-indigo-400 mb-2" size={32} />
                         <p className="text-slate-400 text-sm">Generating Viral Thumbnail...</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <ImageIcon size={32} className="mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">Thumbnail will appear here</p>
                      </div>
                    )}
                    {generatedImage && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                        <Sparkles size={10} className="text-yellow-400"/> AI Generated
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Platform Specific Cards */}
                <div className="space-y-6 pb-6">
                  {result.platforms && result.platforms.length > 0 ? (
                    result.platforms.map((platform, idx) => {
                      const platformMeta = availablePlatforms.find(p => p.id === platform.platformName) || availablePlatforms[0];
                      return (
                        <div key={idx} className="glass-panel rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-700" style={{animationDelay: `${idx * 150}ms`}}>
                          <div className={`p-4 flex items-center justify-between ${platformMeta.color} bg-opacity-20 border-b border-white/5`}>
                             <div className="flex items-center gap-2 font-bold text-white">
                               <span className={`p-1.5 rounded-lg bg-white/10`}>{platformMeta.icon}</span>
                               {platform.platformName}
                             </div>
                             <button 
                               onClick={() => navigator.clipboard.writeText(`${platform.title}\n\n${platform.content}\n\n${platform.hashtags.join(' ')}`)}
                               className="text-white/70 hover:text-white transition-colors"
                               title="Copy Content"
                             >
                               <Copy size={18} />
                             </button>
                          </div>
                          
                          <div className="p-6 space-y-5">
                            <div>
                              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 block">Hook / Title</span>
                              <h3 className="text-lg font-bold text-white leading-tight">{platform.title}</h3>
                            </div>
                            
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 block">Content / Caption</span>
                              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{platform.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {platform.hashtags && platform.hashtags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="pt-4 border-t border-white/5">
                              <div className="flex items-start gap-2">
                                <ImageIcon size={14} className="text-slate-500 mt-1 flex-shrink-0" />
                                <div>
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thumbnail Prompt</span>
                                  <p className="text-xs text-slate-400 mt-1 italic">{platform.thumbnailDescription}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">No platform content generated.</div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl border-dashed border-white/10 bg-slate-900/20 p-8 text-center">
                <div className="p-6 bg-white/5 rounded-full mb-4 border border-white/5 shadow-inner">
                   <Send size={32} className="text-indigo-400/80" />
                </div>
                <p className="font-medium text-slate-300">Deep AI Analysis Ready</p>
                <p className="text-sm mt-1 max-w-xs mx-auto">Fill in the demographics and select platforms to get structured cards and AI-generated thumbnails.</p>
                {!user && (
                    <p className="text-xs text-indigo-400 mt-4 bg-indigo-500/10 py-1 px-3 rounded-full">Free Trial Active: {1 - usageCount} uses left</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};