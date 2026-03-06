"use client";
import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { IRole } from "@app/types/user";
import { useAppSelector, RootState } from "@app/store/store";
import { User as UserIcon, Clock, ArrowLeft, Edit } from "lucide-react";

interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string | IRole;
  userType?: string;
  createdAt?: string;
}

const ViewUser = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const currentUser = useAppSelector(
    (state: RootState) => state.auth.currentUser,
  );

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/auth/users/${id}`);
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load user");
        setTimeout(() => router.push("/users"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      // Check if viewing own profile (uid for auth user, _id for db user)
      if (
        currentUser &&
        (currentUser.uid === id || (currentUser as any)._id === id)
      ) {
        router.push("/profile");
        return;
      }
      fetchUser();
    }
  }, [id, router, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <ContentHeader title="View User" />
        <section className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg p-8 text-center animate-pulse border border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading user details...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent">
        <ContentHeader title="View User" />
        <section className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center justify-center gap-2">
                <i className="fas fa-exclamation-circle text-xl"></i>
                <span className="font-medium">User not found</span>
              </div>
              <button
                onClick={() => router.push("/users")}
                className="mt-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline text-sm"
              >
                Return to Users List
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /**
   * Extracts the display name from a role (string or IRole object)
   * @param role - The role to extract the name from
   * @returns The role display name
   */
  const getRoleDisplayName = (role: string | IRole | undefined): string => {
    if (!role) return "N/A";

    // If role is a string, return it directly
    if (typeof role === "string") return role;

    // If role is an IRole object, try to get displayName, then name
    return role.displayName || role.name || "N/A";
  };

  /**
   * Gets the badge color class based on the role name
   * @param role - The role to get the color for
   * @returns Tailwind CSS classes for the badge
   */
  const getRoleBadgeColor = (role: string | IRole | undefined): string => {
    const roleName = getRoleDisplayName(role);
    switch (roleName.toLowerCase()) {
      case "admin":
      case "superadmin":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50";
      case "manager":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
      case "hr":
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50";
      case "user":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <ContentHeader title="View User" />
      <section className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#368F8B] px-6 py-4 flex items-center justify-between">
              <h5 className="text-white font-semibold text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <UserIcon size={14} className="text-white" />
                </div>
                User Information
              </h5>
              <div className="text-blue-50 text-sm font-medium">
                ID: {user._id.slice(-6)}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              {/* Profile Header Section */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl border-2 border-white dark:border-gray-700 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                  <UserIcon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {user.email}
                  </p>
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    Member since{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1 block">
                    Mobile Number
                  </label>
                  <p className="text-gray-800 dark:text-gray-200 font-medium text-base">
                    {user.mobile || (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        Not provided
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1 block">
                    Role
                  </label>
                  <div className="flex">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1 block">
                    User Type
                  </label>
                  <p className="text-gray-800 dark:text-gray-200 font-medium text-base capitalize">
                    {user.userType || (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 bg-white dark:bg-[#202123] border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition shadow-sm font-medium flex items-center gap-2"
                onClick={() => router.push("/users")}
              >
                <ArrowLeft size={14} /> Back to List
              </button>
              <button
                className="px-4 py-2 bg-[#368F8B] border border-transparent rounded text-white hover:bg-[#2d7a76] transition shadow-lg shadow-[#368F8B]/20 font-medium flex items-center gap-2"
                onClick={() => router.push(`/users/${id}/edit`)}
              >
                <Edit size={14} /> Edit User
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewUser;
