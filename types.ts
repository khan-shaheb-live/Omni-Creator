export enum ToolType {
  CONTENT_ARCHITECT = 'CONTENT_ARCHITECT',
  PRESENTATION_ARCHITECT = 'PRESENTATION_ARCHITECT',
  COMMUNITY_GROWTH = 'COMMUNITY_GROWTH',
  BACKGROUND_REMOVER = 'BACKGROUND_REMOVER',
  AVATAR_GENERATOR = 'AVATAR_GENERATOR',
  AVATAR_VIDEO_GENERATOR = 'AVATAR_VIDEO_GENERATOR',
}

export type Platform = 'Facebook' | 'Instagram' | 'X (Twitter)' | 'YouTube' | 'TikTok';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords
  avatar?: string;
  joinedDate: number;
}

export interface ContentArchitectInput {
  idea: string;
  audience: {
    description: string;
    age: string;
    gender: string;
    location: string;
  };
  platforms: Platform[];
}

export interface ContentStrategyResult {
  analysis: {
    ideaScore: string;
    seoAnalysis: string;
    nicheFit: string;
    audienceBehavior: string;
  };
  platforms: Array<{
    platformName: string;
    title: string;
    content: string;
    hashtags: string[];
    keywords: string[];
    thumbnailDescription: string;
  }>;
}

export interface PresentationArchitectInput {
  topic: string;
  description: string;
  colorTheme: string;
}

export interface CommunityGrowthState {
  tokens: number;
  history: Array<{ action: string; change: number; date: string }>;
}

export interface ProjectData {
  // Content Architect Fields
  idea?: string;
  targetAudience?: string; 
  audienceDetails?: {
    age: string;
    gender: string;
    location: string;
  };
  selectedPlatforms?: Platform[];
  strategyResult?: ContentStrategyResult | string; // Support both legacy string and new JSON
  generatedImageUrl?: string;

  // Presentation Architect Fields
  topic?: string;
  description?: string;
  colorTheme?: string;
  deckResult?: string;
}

export interface Project {
  id: string;
  userId: string; // New field to link project to user
  type: ToolType;
  name: string;
  lastModified: number;
  data: ProjectData;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}