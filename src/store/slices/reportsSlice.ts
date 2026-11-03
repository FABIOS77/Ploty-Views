import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type {
  RawDailyTrendPoint,
  ActionProgressItem,
  ProjectProgressItem,
  OverviewStats,
  RecurrenceVsSingleStats,
} from '../../common/fp/chart-transformers.fp';

export interface TeamMemberContribution {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  completedCount: number;
  xpContributed: number;
  percentageOfTeam: number;
}

export interface DashboardReportData {
  overview: OverviewStats & {
    currentStreak: number;
    longestStreak: number;
    xp: number;
    level: number;
    coins: number;
    gamificationStats?: any;
  };
  statusDistribution: Record<string, number>;
  priorityBreakdown: Record<string, { total: number; completed: number }>;
  dailyTrend: RawDailyTrendPoint[];
  recurrenceVsSingle: RecurrenceVsSingleStats;
  projectsProgress: ProjectProgressItem[];
  actionProgressList: ActionProgressItem[];
}

export interface ProjectReportData {
  project: {
    id: string;
    name: string;
    description?: string | null;
    colorHex: string;
    icon: string;
    isTeamProject?: boolean;
    memberCount: number;
    totalActivities: number;
    progressPercent: number;
  };
  statusDistribution: Record<string, number>;
  priorityBreakdown: Record<string, { total: number; completed: number }>;
  dailyTrend: RawDailyTrendPoint[];
  actionProgress: ActionProgressItem[];
  teamContributions: TeamMemberContribution[];
}

export interface ReportsState {
  dashboard: DashboardReportData | null;
  projectReport: ProjectReportData | null;
  selectedDaysRange: number;
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  dashboard: null,
  projectReport: null,
  selectedDaysRange: 14,
  selectedProjectId: null,
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
    setDaysRange: (state, action: PayloadAction<number>) => {
      state.selectedDaysRange = action.payload;
    },
    setSelectedProjectId: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
    clearReports: (state) => {
      state.dashboard = null;
      state.projectReport = null;
      state.selectedProjectId = null;
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
    builder.addCase(fetchProjectReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectReport.fulfilled, (state, action) => {
      state.loading = false;
      state.projectReport = action.payload;
    });
    builder.addCase(fetchProjectReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setDaysRange, setSelectedProjectId, clearReports } =
  reportsSlice.actions;
export default reportsSlice.reducer;
