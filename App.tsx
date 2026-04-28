import React, { useState } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { ContentArchitect } from './components/tools/ContentArchitect';
import { PresentationArchitect } from './components/tools/PresentationArchitect';
import { CommunityGrowth } from './components/tools/CommunityGrowth';
import { BackgroundRemover } from './components/tools/BackgroundRemover';
import { AvatarGenerator } from './components/tools/AvatarGenerator';
import { AvatarVideoGenerator } from './components/tools/AvatarVideoGenerator';
import { ToolType } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.CONTENT_ARCHITECT);
  const { isAuthenticated, isLoading, showAuthModal, setShowAuthModal } = useAuth();

  const renderActiveTool = () => {
    switch (activeTool) {
      case ToolType.CONTENT_ARCHITECT:
        return <ContentArchitect />;
      case ToolType.PRESENTATION_ARCHITECT:
        return <PresentationArchitect />;
      case ToolType.COMMUNITY_GROWTH:
        return <CommunityGrowth />;
      case ToolType.BACKGROUND_REMOVER:
        return <BackgroundRemover />;
      case ToolType.AVATAR_GENERATOR:
        return <AvatarGenerator />;
      case ToolType.AVATAR_VIDEO_GENERATOR:
        return <AvatarVideoGenerator />;
      default:
        return <ContentArchitect />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-100 bg-slate-950">
      {/* Only show modal if triggered and not authenticated */}
      {showAuthModal && !isAuthenticated && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      <TopNavigation activeTool={activeTool} setActiveTool={setActiveTool} />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
        {/* Removed the blur-sm condition to allow guest viewing */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
          {renderActiveTool()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;