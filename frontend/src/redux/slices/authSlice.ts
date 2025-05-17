import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IUser } from "../../types";
import { CurrencyType } from "../store";

interface AuthState {
  user: IUser | null;
  token: string | null;
  userLoading: boolean;
  error: string | null;
  showLogin: Boolean | false;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
  userLoading: false,
  error: null,
  showLogin: true,
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const register = createAsyncThunk<
  { user: IUser; token: string },
  { email: string; password: string; currency?: CurrencyType },
  { rejectValue: string }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      credentials
    );
    localStorage.setItem("token", response.data.token);
    return {
      user: {
        _id: response.data.userId,
        email: credentials.email,
        currency: credentials.currency,
      },
      token: response.data.token,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error || "Registration failed"
    );
  }
});

export const login = createAsyncThunk<
  { user: IUser; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      credentials
    );
    localStorage.setItem("token", response.data.token);
    return {
      user: {
        _id: response.data.userId,
        email: credentials.email,
        currency: response.data.currency,
      },
      token: response.data.token,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Login failed");
  }
});

export const updateUser = createAsyncThunk<
  IUser,
  { id: string; data: Partial<IUser> },
  { rejectValue: string }
>("auth/updateUser", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/auth/${id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return rejectWithValue("Session Expired, Please Login Again");
    } else {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update expense"
      );
    }
  }
});

export const deleteUser = createAsyncThunk<
  string,
  { id: string },
  { rejectValue: string }
>("auth/deleteUser", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/auth/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return rejectWithValue("Session Expired, Please Login Again");
    } else {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete user"
      );
    }
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    toggleShowLogin: (state) => {
      state.showLogin = !state.showLogin;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.userLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.userLoading = false;
      state.showLogin = true;
      // state.user = action.payload.user;
      // state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.userLoading = false;
      state.error = action.payload || "Registration failed";
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.userLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.userLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.userLoading = false;
      state.error = action.payload || "Login failed";
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.userLoading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.userLoading = false;
      state.user.currency = action.payload.currency;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.userLoading = false;
      state.error = action.payload || "Update failed";
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.userLoading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.userLoading = false;
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.userLoading = false;
      state.error = action.payload || "Falied to delete Account";
    });
  },
});

export const { logout, toggleShowLogin } = authSlice.actions;
export default authSlice.reducer;
