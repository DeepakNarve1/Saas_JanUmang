"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser, setSidebarAccess } from "@store/reducers/auth";
import Main from "@modules/main/Main";
import axios from "@app/utils/axios";
import TrialWarningBanner from "@app/components/TrialWarningBanner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchUserWithPermissions = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch fresh user data with populated role and permissions
      const response = await axios.get(`/auth/me`);

      const userData = response.data.data;

      // Map user's role access to sidebarAccessByRole state
      if (userData.role && typeof userData.role === "object") {
        const roleName = userData.role.name;
        const sidebarAccess = userData.role.sidebarAccess || [];
        dispatch(setSidebarAccess({ [roleName]: sidebarAccess }));
      }

      // Update Redux store with fresh data
      dispatch(setCurrentUser(userData));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Don't log out immediately on error (network blip), but maybe handle it
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a user in Redux, we can show the UI immediately
      if (user) {
        setLoading(false);
      }

      await fetchUserWithPermissions();
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run ONCE on initial mount of the protected group layout

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00563B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrialWarningBanner />
      <Main>{children}</Main>
    </>
  );
}
