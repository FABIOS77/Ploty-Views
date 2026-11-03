import { describe, it, expect } from 'vitest';
import reportsReducer, {
  setDaysRange,
  setSelectedProjectId,
  clearReports,
  type ReportsState,
} from './reportsSlice';

describe('Reports Redux Slice (reportsSlice.ts)', () => {
  const initialTestState: ReportsState = {
    dashboard: null,
    projectReport: null,
    selectedDaysRange: 14,
    selectedProjectId: null,
    loading: false,
    error: null,
  };

  it('handles setDaysRange to toggle between 7, 14, 30 days', () => {
    const state = reportsReducer(initialTestState, setDaysRange(30));
    expect(state.selectedDaysRange).toBe(30);
  });

  it('handles setSelectedProjectId to switch from global to project scope', () => {
    const state = reportsReducer(initialTestState, setSelectedProjectId('proj-99'));
    expect(state.selectedProjectId).toBe('proj-99');
  });

  it('handles clearReports to reset state', () => {
    const stateWithData: ReportsState = {
      ...initialTestState,
      selectedProjectId: 'proj-123',
    };
    const cleared = reportsReducer(stateWithData, clearReports());
    expect(cleared.selectedProjectId).toBeNull();
    expect(cleared.dashboard).toBeNull();
  });
});
