import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";

import { authSlice } from "@app/store/reducers/auth";
import { uiSlice } from "@app/store/reducers/ui";
import { createLogger } from "redux-logger";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    });
    // Only attach the logger in development — never in production builds
    if (process.env.NODE_ENV === "development") {
      return middleware.concat(createLogger());
    }
    return middleware;
  },
});

export default store;

export const useAppDispatch = () => useDispatch<ReduxDispatch>();
export const useAppSelector: TypedUseSelectorHook<ReduxState> = useSelector;

/* Types */
export type ReduxStore = typeof store;
export type ReduxState = ReturnType<typeof store.getState>;
export type RootState = ReduxState;
export type ReduxDispatch = typeof store.dispatch;
export type AppDispatch = ReduxDispatch;
export type ReduxThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  ReduxState,
  unknown,
  Action
>;
