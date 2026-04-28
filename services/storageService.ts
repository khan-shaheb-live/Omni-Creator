import { Project, ToolType } from "../types";

const STORAGE_KEY = "omnicreator_projects";

// Now requires userId to return specific projects
export const getProjects = (type: ToolType, userId: string): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const allProjects: Project[] = JSON.parse(stored);
    
    // Filter by type AND userId
    return allProjects
      .filter((p) => p.type === type && p.userId === userId)
      .sort((a, b) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error("Failed to load projects", error);
    return [];
  }
};

export const saveProject = (project: Project): void => {
  try {
    if (!project.userId) {
      console.error("Cannot save project without userId");
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    let allProjects: Project[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = allProjects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      allProjects[existingIndex] = project;
    } else {
      allProjects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
  } catch (error) {
    console.error("Failed to save project", error);
  }
};

export const deleteProject = (id: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let allProjects: Project[] = JSON.parse(stored);
    allProjects = allProjects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
  } catch (error) {
    console.error("Failed to delete project", error);
  }
};