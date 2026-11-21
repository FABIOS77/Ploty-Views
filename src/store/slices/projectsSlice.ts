import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface ProjectMember {
  id: string;
  projectId?: string;
  userId?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface ProjectSummary {
  total: number;
  totalCount?: number;
  completed: number;
  pending: number;
  inProgress?: number;
  overdue?: number;
  progressPercent: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  colorHex: string;
  icon: string;
  isTeamProject?: boolean;
  ownerId?: string;
  creatorId?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  progressSummary?: ProjectSummary;
  summary?: ProjectSummary;
  _count?: {
    members: number;
    activities: number;
  };
}

export interface SearchedUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ProjectsState {
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  searchResults: SearchedUser[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch projects';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch project';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (
    payload: {
      name: string;
      description?: string;
      colorHex?: string;
      icon?: string;
      isTeamProject?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/projects', payload);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create project';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (
    payload: {
      id: string;
      data: {
        name?: string;
        description?: string;
        colorHex?: string;
        icon?: string;
        isTeamProject?: boolean;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/projects/${payload.id}`, payload.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update project';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`);
      return projectId;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete project';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async (
    payload: { projectId: string; userId: string; role?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`/projects/${payload.projectId}/members`, {
        userId: payload.userId,
        role: payload.role || 'MEMBER',
      });
      const rawData = response.data;
      const member = rawData?.member ?? rawData;
      return { projectId: payload.projectId, member };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add member';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async (
    payload: { projectId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(`/projects/${payload.projectId}/members/${payload.userId}`);
      return payload;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove member';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const searchUsers = createAsyncThunk(
  'projects/searchUsers',
  async (query: string, { rejectWithValue }) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Search failed';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchProjectById
    builder.addCase(fetchProjectById.fulfilled, (state, action) => {
      state.selectedProject = action.payload;
    });

    // createProject
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.projects.unshift(action.payload);
      state.selectedProject = action.payload;
    });

    // updateProject
    builder.addCase(updateProject.fulfilled, (state, action) => {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.projects[idx] = action.payload;
      }
      if (state.selectedProject?.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
    });
    builder.addCase(updateProject.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteProject
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.selectedProject?.id === action.payload) {
        state.selectedProject = null;
      }
    });
    builder.addCase(deleteProject.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // searchUsers
    builder.addCase(searchUsers.pending, (state) => {
      state.searchLoading = true;
    });
    builder.addCase(searchUsers.fulfilled, (state, action) => {
      state.searchLoading = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchUsers.rejected, (state) => {
      state.searchLoading = false;
    });

    // addProjectMember
    builder.addCase(addProjectMember.fulfilled, (state, action) => {
      if (state.selectedProject && state.selectedProject.id === action.payload.projectId) {
        if (!state.selectedProject.members) {
          state.selectedProject.members = [];
        }
        const member = action.payload.member;
        if (member) {
          const normalizedMember = {
            id: member.id || `member-${Date.now()}`,
            role: member.role || 'MEMBER',
            projectId: action.payload.projectId,
            userId: member.userId || member.user?.id,
            user: member.user || {
              id: member.userId || '',
              username: member.username || 'Usuario',
              email: member.email || '',
              avatarUrl: member.avatarUrl || null,
            },
          };
          state.selectedProject.members = state.selectedProject.members.filter(
            (m) => (m.user?.id || m.userId) !== normalizedMember.user.id,
          );
          state.selectedProject.members.push(normalizedMember);
        }
      }
    });

    // removeProjectMember
    builder.addCase(removeProjectMember.fulfilled, (state, action) => {
      if (state.selectedProject && state.selectedProject.id === action.payload.projectId) {
        if (state.selectedProject.members) {
          state.selectedProject.members = state.selectedProject.members.filter(
            (m) => (m.user?.id ?? m.userId) !== action.payload.userId,
          );
        }
      }
    });
  },
});

export const { clearSearchResults, setSelectedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
