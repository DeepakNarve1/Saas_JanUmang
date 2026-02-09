"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { useAppDispatch } from "@app/store/store";
import {
  setCurrentUser,
  setSidebarAccessByRole,
} from "@app/store/reducers/auth";
import { DEFAULT_SIDEBAR_ACCESS_BY_ROLE } from "@app/utils/menu";
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

      // Fetch sidebar permissions
      // Fetch sidebar permissions
      const fetchSidebarPermissions = async () => {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const res = await axios.get("/rbac/sidebar-permissions");
            const map = res.data?.data;
            if (map && typeof map === "object" && !Array.isArray(map)) {
              dispatch(setSidebarAccessByRole(map));
              localStorage.setItem("sidebarAccessByRole", JSON.stringify(map));
            }
          }
        } catch (error) {
          console.warn("Failed to fetch sidebar access from server", error);
        }
      };

      const storedPermissions = localStorage.getItem("sidebarAccessByRole");
      if (storedPermissions) {
        dispatch(setSidebarAccessByRole(JSON.parse(storedPermissions)));
        fetchSidebarPermissions(); // Background update
      } else {
        await fetchSidebarPermissions(); // Blocking fetch if no cache
        // Fallback default if still failed
        if (!localStorage.getItem("sidebarAccessByRole")) {
          dispatch(setSidebarAccessByRole(DEFAULT_SIDEBAR_ACCESS_BY_ROLE));
        }
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
