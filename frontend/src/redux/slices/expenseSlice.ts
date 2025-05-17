import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IExpense } from "../../types";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { toggleShowLogin } from "@/redux/slices/authSlice";

interface ExpenseState {
  expenses: IExpense[];
  expenseLoading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  expenseLoading: false,
  error: null,
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const readExpenses = createAsyncThunk<
  IExpense[],
  void,
  { rejectValue: string }
>("expenses/readExpenses", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/expenses`, {
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

export const createExpense = createAsyncThunk<
  IExpense,
  Partial<IExpense>,
  { rejectValue: string }
>("expenses/createExpense", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/expenses`, data, {
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

export const updateExpense = createAsyncThunk<
  IExpense,
  { id: string; data: Partial<IExpense> },
  { rejectValue: string }
>("expenses/updateExpense", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/expenses/${id}`, data, {
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

export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("expenses/deleteExpense", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE_URL}/api/expenses/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
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

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Expenses
    builder.addCase(readExpenses.pending, (state) => {
      state.expenseLoading = true;
      state.error = null;
    });
    builder.addCase(readExpenses.fulfilled, (state, action) => {
      state.expenseLoading = false;
      state.expenses = action.payload;
    });
    builder.addCase(readExpenses.rejected, (state, action) => {
      state.expenseLoading = false;
      state.error = action.payload || "Failed to fetch expenses";
    });

    // Create Expense
    builder.addCase(createExpense.pending, (state) => {
      state.expenseLoading = true;
      state.error = null;
    });
    builder.addCase(createExpense.fulfilled, (state, action) => {
      state.expenseLoading = false;
      state.expenses.push(action.payload);
    });
    builder.addCase(createExpense.rejected, (state, action) => {
      state.expenseLoading = false;
      state.error = action.payload || "Failed to create expense";
    });

    // Update Expense
    builder.addCase(updateExpense.pending, (state) => {
      state.expenseLoading = true;
      state.error = null;
    });
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      state.expenseLoading = false;
      state.expenses = state.expenses.map((e) =>
        e._id === action.payload._id ? action.payload : e
      );
    });
    builder.addCase(updateExpense.rejected, (state, action) => {
      state.expenseLoading = false;
      state.error = action.payload || "Failed to update expense";
    });

    // Delete Expense
    builder.addCase(deleteExpense.pending, (state) => {
      state.expenseLoading = true;
      state.error = null;
    });
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.expenseLoading = false;
      state.expenses = state.expenses.filter((e) => e._id !== action.payload);
    });
    builder.addCase(deleteExpense.rejected, (state, action) => {
      state.expenseLoading = false;
      state.error = action.payload || "Failed to delete expense";
    });
  },
});

export default expenseSlice.reducer;
