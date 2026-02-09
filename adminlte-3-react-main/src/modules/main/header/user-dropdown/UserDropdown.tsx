"use client";

import { useState, useRef, useEffect } from "react";
import axios from "@app/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@app/store/store";
import { setCurrentUser } from "@app/store/reducers/auth";
import { IRole } from "@app/types/user";

import { Avatar, AvatarFallback, AvatarImage } from "@app/components/ui/avatar";
import { Button } from "@app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@app/components/ui/dropdown-menu";

const UserDropdown = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logOut = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout activity log failed", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("overrideTenantId");
      dispatch(setCurrentUser(null));
      toast.success("Logged out successfully");
      setOpen(false);
      router.push("/login");
    }
  };

  const navigateToProfile = () => {
    setOpen(false);
    router.push("/profile");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-11 w-11 rounded-full p-0 ring-offset-background transition-all hover:ring-4 hover:ring-[#00563B]/10 focus-visible:ring-4 focus-visible:ring-[#00563B]/20"
          >
            <Avatar className="h-11 w-11 border-2 border-transparent">
              <AvatarImage
                src={currentUser.photoURL || ""}
                alt={currentUser.email}
              />
              <AvatarFallback className="bg-linear-to-br from-gray-100 to-gray-200 text-gray-700 font-medium text-lg">
                {currentUser.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-0 overflow-hidden dark:bg-[#202123]"
        >
          {/* User Header */}
          <div
            onClick={navigateToProfile}
            className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-[#2a2b2d] dark:to-[#202123] p-6 text-center border-b dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Avatar className="mx-auto h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={currentUser.photoURL || ""} />
              <AvatarFallback className="bg-linear-to-br from-[#00563B] to-[#368F8B] text-white text-2xl font-bold">
                {currentUser.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100 text-lg">
              {currentUser.name || "User"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser.email}
            </p>
            <p className="text-sm font-bold mt-1 text-[#368F8B]">
              {(currentUser as any).tenant?.name || "Independent Organization"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {typeof currentUser.role === "string"
                ? currentUser.role
                : (currentUser.role as IRole)?.displayName ||
                  (currentUser.role as IRole)?.name ||
                  "Member"}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <DropdownMenuItem
              onClick={navigateToProfile}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#00563B] dark:hover:text-[#4ade80] cursor-pointer font-medium"
            >
              View Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("start-tour"));
              }}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Start Tour
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 dark:bg-gray-800" />

            <DropdownMenuItem
              onClick={logOut}
              className="px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer font-medium"
            >
              Sign Out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDropdown;
