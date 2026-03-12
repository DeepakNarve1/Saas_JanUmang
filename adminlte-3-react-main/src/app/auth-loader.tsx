"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@app/store/reducers/auth";
import { Loading } from "@app/components/Loading";

export default function AuthLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          // Always fetch fresh user data from the server.
          // The axios interceptor will silently refresh the access token
          // via the HttpOnly cookie if it has expired.
          // We NEVER fall back to a stale localStorage user object —
          // role/permission changes would not be reflected if we did.
          const res = await axios.get("/auth/me");
          const freshUser = res.data?.data;
          if (freshUser) {
            dispatch(setCurrentUser(freshUser));
          } else {
            // Profile endpoint returned no user → clear stale token
            localStorage.removeItem("token");
            dispatch(setCurrentUser(null));
          }
        } catch {
          // Network error or unrecoverable 401 after refresh attempt failed.
          // Clear the stale token so the user is sent to login.
          localStorage.removeItem("token");
          dispatch(setCurrentUser(null));
        }
      } else {
        dispatch(setCurrentUser(null));
      }

      setIsAppLoading(false);
    };

    initAuth();
  }, [dispatch]);

  if (isAppLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
