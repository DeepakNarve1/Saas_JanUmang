"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser, setSidebarAccess } from "@store/reducers/auth";
import Main from "@modules/main/Main";
import axios from "@app/utils/axios";
import TrialWarningBanner from "@app/components/TrialWarningBanner";
import { AlertTriangle, LogOut, PhoneCall } from "lucide-react";
import { Button } from "@app/components/ui/button";

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

      // Fetch fresh user data with populated role and permissions.
      // The axios interceptor handles silent token refresh if needed.
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
      // If we get a 401 even after the refresh interceptor tried, force logout
      localStorage.removeItem("token");
      router.push("/login");
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

  // Check for organization suspension - Block access for non-superadmins
  const isSuspended = user?.tenant?.status === "suspended";
  const isSuperAdmin = user?.level === "superadmin" || user?.level === "system_admin";

  if (isSuspended && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-amber-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Suspended</h1>
          <p className="text-gray-600 mb-8">
            Your organization&apos;s access to <strong>Jan Umang</strong> has been temporarily suspended.
            Please reach out to your administrator or our support team for assistance.
          </p>
          <div className="space-y-3">
            <Button 
              className="w-full bg-[#368F8B] hover:bg-[#2d7a76] gap-2 py-6 text-lg"
              onClick={() => window.location.href = "mailto:support@janumang.com"}
            >
              <PhoneCall size={20} /> Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2 py-6 text-lg"
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
            >
              <LogOut size={20} /> Sign Out
            </Button>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            Organization ID: <code className="bg-gray-100 px-1 rounded">{user?.tenant?.slug}</code>
          </p>
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
