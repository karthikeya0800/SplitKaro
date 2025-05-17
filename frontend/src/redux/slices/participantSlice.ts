import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IExpense, IPaidFor, IParticipant } from "../../types";

interface ParticipantState {
  participants: IParticipant[];
  participantLoading: boolean;
  error: string | null;
}

const initialState: ParticipantState = {
  participants: [],
  participantLoading: false,
  error: null,
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const readParticipants = createAsyncThunk<
  IParticipant[],
  void,
  { rejectValue: string }
>("participants/readParticipants", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/participants`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return rejectWithValue("Session Expired, Please Login Again");
    } else {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create expense"
      );
    }
  }
});

export const createParticipant = createAsyncThunk<
  IParticipant,
  { name: string; email?: string },
  { rejectValue: string }
>("participants/createParticipant", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/participants`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return rejectWithValue("Session Expired, Please Login Again");
    } else {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create expense"
      );
    }
  }
});

export const createMultipleParticipants = createAsyncThunk<
  IParticipant[],
  { name?: string }[],
  { rejectValue: string }
>(
  "participants/createMultipleParticipants",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/participants/multiple`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue("Session Expired, Please Login Again");
      } else {
        return rejectWithValue(
          error.response?.data?.error || "Failed to create expense"
        );
      }
    }
  }
);

export const updateParticipant = createAsyncThunk<
  IParticipant,
  { id: string; name: string; email?: string },
  { rejectValue: string }
>(
  "participants/updateParticipant",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/participants/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue("Session Expired, Please Login Again");
      } else {
        return rejectWithValue(
          error.response?.data?.error || "Failed to create expense"
        );
      }
    }
  }
);

export const deleteParticipant = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("participants/deleteParticipant", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/participants/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.status === 200) {
      // Remove all the expenses for which paid by is this participant
      const expenses = await axios.get(`${BASE_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const expensesToDelete = expenses.data.filter(
        (expense: IExpense) => expense.paidBy.participantId === id
      );
      for (const expense of expensesToDelete) {
        await axios.delete(`${BASE_URL}/api/expenses/${expense._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Remove this participant in paid for of other participant expenses
      const expensesAfterDelete = await axios.get(`${BASE_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const expensesToUpdate = expensesAfterDelete.data.filter(
        (expense: IExpense) =>
          expense.paidFor.some((item) => item.participantId === id)
      );
      for (const expense of expensesToUpdate) {
        const data = {
          ...expense,
          paidFor: expense.paidFor.filter(
            (item: IPaidFor) => item.participantId !== id
          ),
        };
        const response = await axios.put(
          `${BASE_URL}/api/expenses/${expense._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    }
    return id;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return rejectWithValue("Session Expired, Please Login Again");
    } else {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create expense"
      );
    }
  }
});

const participantSlice = createSlice({
  name: "participants",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Participants
    builder.addCase(readParticipants.pending, (state) => {
      state.participantLoading = true;
      state.error = null;
    });
    builder.addCase(readParticipants.fulfilled, (state, action) => {
      state.participantLoading = false;
      state.participants = action.payload;
    });
    builder.addCase(readParticipants.rejected, (state, action) => {
      state.participantLoading = false;
      state.error = action.payload || "Failed to fetch participants";
    });

    // Create Participant
    builder.addCase(createParticipant.pending, (state) => {
      state.participantLoading = true;
      state.error = null;
    });
    builder.addCase(createParticipant.fulfilled, (state, action) => {
      state.participantLoading = false;
      state.participants.push(action.payload);
    });
    builder.addCase(createParticipant.rejected, (state, action) => {
      state.participantLoading = false;
      state.error = action.payload || "Failed to create participant";
    });

    // Create Multiple Participants
    builder.addCase(createMultipleParticipants.pending, (state) => {
      state.participantLoading = true;
      state.error = null;
    });
    builder.addCase(createMultipleParticipants.fulfilled, (state, action) => {
      state.participantLoading = false;
      state.participants = action.payload;
    });
    builder.addCase(createMultipleParticipants.rejected, (state, action) => {
      state.participantLoading = false;
      state.error = action.payload || "Failed to create participant";
    });

    // Update Participant
    builder.addCase(updateParticipant.pending, (state) => {
      state.participantLoading = true;
      state.error = null;
    });
    builder.addCase(updateParticipant.fulfilled, (state, action) => {
      state.participantLoading = false;
      state.participants = state.participants.map((p) =>
        p._id === action.payload._id ? action.payload : p
      );
    });
    builder.addCase(updateParticipant.rejected, (state, action) => {
      state.participantLoading = false;
      state.error = action.payload || "Failed to update participant";
    });

    // Delete Participant
    builder.addCase(deleteParticipant.pending, (state) => {
      state.participantLoading = true;
      state.error = null;
    });
    builder.addCase(deleteParticipant.fulfilled, (state, action) => {
      state.participantLoading = false;
      state.participants = state.participants.filter(
        (p) => p._id !== action.payload
      );
    });
    builder.addCase(deleteParticipant.rejected, (state, action) => {
      state.participantLoading = false;
      state.error = action.payload || "Failed to delete participant";
    });
  },
});

export default participantSlice.reducer;
