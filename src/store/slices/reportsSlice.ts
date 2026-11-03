import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface DashboardReport {
  summary: {
    totalActivities: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  statusDistribution?: Record<string, number>;
  priorityBreakdown?: Record<string, number>;
  dailyTrends?: Array<{
    date: string;
    completedCount: number;
    createdCount: number;
  }>;
  topPerformers?: Array<{
    userId: string;
    username: string;
    avatarUrl?: string | null;
    completedCount: number;
    totalXp: number;
  }>;
}

export interface ProjectReport {
  projectId: string;
  projectName: string;
  summary: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
  };
  memberContributions?: Array<{
    userId: string;
    username: string;
    role: string;
    completedActivities: number;
    xpEarned: number;
  }>;
}

export interface ReportsState {
  dashboard: DashboardReport | null;
  projectReport: ProjectReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  dashboard: null,
  projectReport: null,
  loading: false,
  error: null,
};

export const fetchDashboardReport = createAsyncThunk(
  'reports/fetchDashboardReport',
  async (days: number | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/dashboard', {
        params: { days: days || 14 },
      });
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch dashboard report';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const fetchProjectReport = createAsyncThunk(
  'reports/fetchProjectReport',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/projects/${projectId}`);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch project report';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.dashboard = null;
      state.projectReport = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDashboardReport
    builder.addCase(fetchDashboardReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardReport.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchDashboardReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchProjectReport
    builder.addCase(fetchProjectReport.fulfilled, (state, action) => {
      state.projectReport = action.payload;
    });
  },
});

export const { clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
