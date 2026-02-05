import { IUser } from "@app/types/user";
import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  currentUser: IUser | null;
  sidebarAccessByRole: Record<string, string[]>;
}

const initialState: AuthState = {
  currentUser: null,
  sidebarAccessByRole: {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (
      state: AuthState,
      { payload }: { payload: IUser | null }
    ) => {
      state.currentUser = payload;
    },
    setSidebarAccessByRole: (
      state: AuthState,
      { payload }: { payload: Record<string, string[]> }
    ) => {
      state.sidebarAccessByRole = payload;
    },
  },
});

export const { setCurrentUser, setSidebarAccessByRole } = authSlice.actions;

export default authSlice.reducer;
