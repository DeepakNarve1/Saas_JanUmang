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

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // If role is missing, refresh from backend
          if (!parsedUser.role && parsedUser._id) {
            try {
              const res = await axios.get(`/auth/users/${parsedUser._id}`);

              const freshUser = res.data?.data || parsedUser;
              localStorage.setItem("user", JSON.stringify(freshUser));
              dispatch(setCurrentUser(freshUser));
            } catch (err) {
              console.error("Failed to refresh user from backend", err);
              dispatch(setCurrentUser(parsedUser));
            }
          } else {
            dispatch(setCurrentUser(parsedUser));
          }
        } catch (error) {
          console.error("Failed to parse stored user", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          dispatch(setCurrentUser(null));
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
