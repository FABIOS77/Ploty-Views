import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from '@reduxjs/toolkit';
import api from '../../services/api';
import {
  buildConsistencyHeatmap,
  buildPlayerRadarMetrics,
  calculateEfficiencyScore,
  computeProjectComparisonMatrix,
  normalizeRecurrenceVsSingle,
  transformDailyTrendForChart,
  transformPriorityBreakdownForChart,
  transformStatusDistributionForChart,
  type RawDailyTrendPoint,
  type ActionProgressItem,
  type ProjectProgressItem,
  type OverviewStats,
  type RecurrenceVsSingleStats,
} from '../../common/fp/chart-transformers.fp';

export interface TeamMemberContribution {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  completedCount: number;
  xpContributed: number;
  contributionPercentage: number;
  percentageOfTeam?: number;
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
  selectedDaysRange: 30,
  selectedProjectId: null,
  loading: false,
  error: null,
};

export const fetchDashboardReport = createAsyncThunk(
  'reports/fetchDashboardReport',
  async (days: number | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/dashboard', {
        params: { days: days || 30 },
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

// ==========================================
// MEMOIZED REDUX SELECTORS (createSelector)
// ==========================================
const selectReportsSlice = (state: { reports: ReportsState }) => state.reports;

export const selectGlobalDailyTrendMemo = createSelector(
  [selectReportsSlice],
  (reports) => transformDailyTrendForChart(reports.dashboard?.dailyTrend),
);

export const selectProjectDailyTrendMemo = createSelector(
  [selectReportsSlice],
  (reports) => transformDailyTrendForChart(reports.projectReport?.dailyTrend),
);

export const selectGlobalEfficiencyScoreMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    calculateEfficiencyScore(
      reports.dashboard?.overview,
      reports.dashboard?.recurrenceVsSingle,
    ),
);

export const selectGlobalProjectComparisonMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    computeProjectComparisonMatrix(reports.dashboard?.projectsProgress),
);

export const selectGlobalRecurrenceStatsMemo = createSelector(
  [selectReportsSlice],
  (reports) => normalizeRecurrenceVsSingle(reports.dashboard?.recurrenceVsSingle),
);

export const selectGlobalPriorityChartMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    transformPriorityBreakdownForChart(reports.dashboard?.priorityBreakdown),
);

export const selectProjectPriorityChartMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    transformPriorityBreakdownForChart(reports.projectReport?.priorityBreakdown),
);

export const selectGlobalStatusPieMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    transformStatusDistributionForChart(reports.dashboard?.statusDistribution),
);

export const selectProjectStatusPieMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    transformStatusDistributionForChart(reports.projectReport?.statusDistribution),
);

export const selectGlobalHeatmapMemo = createSelector(
  [selectReportsSlice],
  (reports) => buildConsistencyHeatmap(reports.dashboard?.dailyTrend, 30),
);

export const selectGlobalRadarMetricsMemo = createSelector(
  [selectReportsSlice],
  (reports) =>
    buildPlayerRadarMetrics({
      overview: reports.dashboard?.overview,
      priorityBreakdown: reports.dashboard?.priorityBreakdown,
      recurrenceVsSingle: reports.dashboard?.recurrenceVsSingle,
      projectsProgress: reports.dashboard?.projectsProgress,
    }),
);

export default reportsSlice.reducer;
