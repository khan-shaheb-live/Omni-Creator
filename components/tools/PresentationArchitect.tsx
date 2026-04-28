import React, { useState, useEffect } from 'react';
import { Presentation, Palette, FileText, Loader2, Download, Save, Plus, Trash2, FolderOpen, History } from 'lucide-react';
import { generatePresentationDeck } from '../../services/geminiService';
import { Project, ToolType } from '../../types';
import { getProjects, saveProject, deleteProject } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

export const PresentationArchitect: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();
  
  // Form State
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('Professional Blue');
  const [result, setResult] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
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
      setProjects(getProjects(ToolType.PRESENTATION_ARCHITECT, user.id));
    }
  };

  const handleNewProject = () => {
    setCurrentProjectId(null);
    setTopic('');
    setDescription('');
    setColorTheme('Professional Blue');
    setResult(null);
  };

  const handleSaveProject = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!topic) return;

    const projectId = currentProjectId || crypto.randomUUID();
    const projectName = topic.slice(0, 30) + (topic.length > 30 ? '...' : '');

    const newProject: Project = {
      id: projectId,
      userId: user.id,
      type: ToolType.PRESENTATION_ARCHITECT,
      name: projectName,
      lastModified: Date.now(),
      data: {
        topic,
        description,
        colorTheme,
        deckResult: result || undefined
      }
    };

    saveProject(newProject);
    setCurrentProjectId(projectId);
    loadProjects();
    alert('Presentation project saved!');
  };

  const handleLoadProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setTopic(project.data.topic || '');
    setDescription(project.data.description || '');
    setColorTheme(project.data.colorTheme || 'Professional Blue');
    setResult(project.data.deckResult || null);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this presentation project?')) {
      deleteProject(id);
      loadProjects();
      if (currentProjectId === id) {
        handleNewProject();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    // Guest Usage Check
    if (!user) {
      if (usageCount >= 1) {
        setShowAuthModal(true);
        return;
      }
      incrementUsage();
    }

    setIsLoading(true);
    try {
      const response = await generatePresentationDeck({ topic, description, colorTheme });
      setResult(response);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const themes = [
    'Professional Blue',
    'Modern Minimalist (Black/White)',
    'Creative & Vibrant',
    'Nature & Organic (Green/Beige)',
    'Tech & Dark Mode (Neon/Black)',
    'Warm & Cozy (Orange/Cream)'
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Project Sidebar */}
      <div className={`${showProjects && user ? 'w-full lg:w-72' : 'hidden lg:block lg:w-0 lg:overflow-hidden'} transition-all duration-300 flex-shrink-0 flex flex-col gap-4`}>
        <div className="flex items-center justify-between lg:hidden mb-2">
           <h3 className="font-semibold text-slate-300">My Presentations</h3>
           <button onClick={() => setShowProjects(false)} className="text-slate-400">Hide</button>
        </div>

        <button 
          onClick={handleNewProject}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
        >
          <Plus size={18} /> New Presentation
        </button>

        <div className="glass-panel flex-1 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <FolderOpen size={16} className="text-indigo-400" />
              Saved Decks
            </h3>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
            {projects.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-xs">
                No saved presentations yet.
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
             <h2 className="text-2xl font-bold text-white tracking-tight">Presentation Architect</h2>
             <p className="text-slate-400 text-sm">Generate structured, visually cohesive slide decks in seconds.</p>
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
               disabled={!topic}
               className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Save size={16} /> {user ? 'Save' : 'Login to Save'}
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="md:col-span-1 space-y-6 flex flex-col">
            <div className="glass-panel p-6 rounded-2xl shadow-xl flex-1 flex flex-col gap-5">
              <form onSubmit={handleSubmit} className="contents">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Presentation Topic
                  </label>
                  <div className="relative">
                    <Presentation className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Q3 Marketing Report"
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Context & Details
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-500" size={18} />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Key points, data, or specific focus areas..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-32 text-sm placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Visual Theme
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-3 text-slate-500" size={18} />
                    <select
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-sm bg-black/20"
                    >
                      {themes.map(t => <option key={t} value={t} className="bg-slate-800 text-slate-200">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !topic}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-400/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Designing...</span>
                      </>
                    ) : (
                      <span>Generate Deck Structure</span>
                    )}
                  </button>
                  {!user && (
                    <p className="text-xs text-center text-slate-500 mt-3">Free trial active</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col min-h-[500px]">
            {result ? (
              <div className="glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-slate-200 font-medium">
                     <Presentation size={18} className="text-indigo-400"/>
                     <span>Deck Outline</span>
                   </div>
                   <button 
                     onClick={() => navigator.clipboard.writeText(result)}
                     className="text-slate-400 hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors"
                   >
                     <Download size={14} /> Copy Markdown
                   </button>
                </div>
                <div className="p-8 overflow-auto custom-scrollbar flex-1">
                  <div className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">
                    {result}
                  </div>
                </div>
              </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl border-dashed border-white/10 bg-slate-900/20 p-8 text-center">
                <div className="p-6 bg-white/5 rounded-full mb-4 border border-white/5 shadow-inner">
                  <Presentation size={32} className="text-indigo-400/80" />
                </div>
                <p className="font-medium text-slate-300">Your slide deck awaits</p>
                <p className="text-sm mt-1 max-w-xs mx-auto">Enter a topic to generate a structure, or select a saved deck.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};