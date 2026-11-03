import { describe, it, expect } from 'vitest';
import projectsReducer, {
  clearSearchResults,
  setSelectedProject,
  type ProjectsState,
  type ProjectItem,
} from './projectsSlice';

describe('Projects Redux Slice (projectsSlice.ts)', () => {
  const dummyProject: ProjectItem = {
    id: 'proj-1',
    name: 'DevOps & CI/CD Pipeline',
    description: 'Automate build and deployment scripts',
    colorHex: '#7477FF',
    icon: '🚀',
    creatorId: 'user-1',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  };

  const initialTestState: ProjectsState = {
    projects: [dummyProject],
    selectedProject: null,
    searchResults: [
      {
        id: 'user-2',
        username: 'dev_sarah',
        email: 'sarah@ploty.app',
      },
    ],
    loading: false,
    searchLoading: false,
    error: null,
  };

  it('handles clearSearchResults to reset debounced member search', () => {
    const state = projectsReducer(initialTestState, clearSearchResults());
    expect(state.searchResults.length).toBe(0);
  });

  it('handles setSelectedProject to view project details modal', () => {
    const state = projectsReducer(initialTestState, setSelectedProject(dummyProject));
    expect(state.selectedProject?.id).toBe('proj-1');
    expect(state.selectedProject?.name).toBe('DevOps & CI/CD Pipeline');
  });
});
