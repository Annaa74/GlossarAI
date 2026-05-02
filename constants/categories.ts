import { VocabCategory } from '../types';

export interface CategoryInfo {
  id: VocabCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'AI/ML',
    name: 'AI & Machine Learning',
    icon: 'robot',
    color: '#8B5CF6',
    description: 'Artificial intelligence and machine learning concepts',
  },
  {
    id: 'Agentic AI',
    name: 'Agentic AI',
    icon: 'brain',
    color: '#EC4899',
    description: 'AI agents, tool use, and autonomous systems',
  },
  {
    id: 'Backend',
    name: 'Backend',
    icon: 'server',
    color: '#10B981',
    description: 'Server-side development and APIs',
  },
  {
    id: 'Frontend',
    name: 'Frontend',
    icon: 'monitor',
    color: '#3B82F6',
    description: 'Client-side development and UI frameworks',
  },
  {
    id: 'DevOps',
    name: 'DevOps',
    icon: 'cogs',
    color: '#F59E0B',
    description: 'CI/CD, infrastructure, and deployment',
  },
  {
    id: 'Cloud',
    name: 'Cloud',
    icon: 'cloud',
    color: '#6366F1',
    description: 'Cloud computing and services',
  },
  {
    id: 'Databases',
    name: 'Databases',
    icon: 'database',
    color: '#EF4444',
    description: 'Database systems and data management',
  },
  {
    id: 'Security',
    name: 'Security',
    icon: 'shield-half-full',
    color: '#14B8A6',
    description: 'Application and network security',
  },
];

export const getCategoryInfo = (category: VocabCategory): CategoryInfo => {
  return CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
};

export const getCategoryColor = (category: VocabCategory): string => {
  return getCategoryInfo(category).color;
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#10B981',
  2: '#34D399',
  3: '#FBBF24',
  4: '#F97316',
  5: '#EF4444',
};
