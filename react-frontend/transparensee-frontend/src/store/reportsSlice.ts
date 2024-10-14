import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Report{
    id: number;
    title: string;
    description: string;
}

interface ReportsState {
    reports: Report[];
    loading: boolean;
    error: string | null;
}

const initialState: ReportsState = {
    reports: [],
    loading: false,
    error: null,
};

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setReports(state, action: PayloadAction<Report[]>) {
            state.reports = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

export const { setReports, setLoading, setError } = reportsSlice.actions;
export default reportsSlice.reducer;