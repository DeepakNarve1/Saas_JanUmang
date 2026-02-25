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
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          // Always refresh user from profile endpoint to get fresh SaaS context (tenantId, level, etc.)
          const res = await axios.get("/auth/profile");
          const freshUser = res.data?.data;
          if (freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
            dispatch(setCurrentUser(freshUser));
          } else if (storedUser) {
            dispatch(setCurrentUser(JSON.parse(storedUser)));
          }
        } catch (error) {
          console.error("Failed to sync auth state", error);
          if (storedUser) {
            dispatch(setCurrentUser(JSON.parse(storedUser)));
          }
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
