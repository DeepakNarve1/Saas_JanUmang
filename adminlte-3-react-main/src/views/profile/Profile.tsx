import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ContentHeader } from "@components";
import Image from "@app/components/Image";
import SettingsTab from "./SettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import MFATab from "./MFATab";
import { useAppSelector } from "@app/store/store";
import {
  User as UserIcon,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  MoreVertical,
} from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("SETTINGS");
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const userRoleDisplay = useMemo(() => {
    if (!currentUser?.role) return "User";
    if (typeof currentUser.role === "string") return currentUser.role;
    return currentUser.role.displayName || currentUser.role.name || "User";
  }, [currentUser]);

  return (
    <>
      <ContentHeader title="User Profile" />
      <section className="p-4 md:p-6 bg-gray-50/50 dark:bg-[#1a1b1e]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: User Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden text-center transition-all hover:shadow-xl">
                <div className="h-24 bg-linear-to-r from-[#368F8B] to-[#2d7a76]" />
                <div className="px-6 pb-8 -mt-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-1 border-4 border-white dark:border-[#1a1b1e] rounded-full bg-white dark:bg-[#1a1b1e] shadow-xl inline-block">
                      <Image
                        width={100}
                        height={100}
                        rounded
                        src={currentUser?.photoURL}
                        fallbackSrc="/img/default-profile.png"
                        alt="User profile"
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                    {currentUser?.name || "User"}
                  </h3>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#368F8B]/10 text-[#368F8B] dark:bg-[#368F8B]/20 dark:text-[#45b1ac] mb-6">
                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                    {userRoleDisplay}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center font-medium">
                        <Mail className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                        Email
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate ml-4">
                        {currentUser?.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center font-medium">
                        <Phone className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                        Mobile
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 ml-4">
                        {currentUser?.mobile || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Management */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[500px] flex flex-col transition-all">
                <div className="border-b border-gray-100 dark:border-gray-800 p-2 bg-gray-50/50 dark:bg-gray-800/50">
                  <ul className="flex flex-wrap p-1 gap-2">
                    <li>
                      <button
                        className={`flex items-center px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                          activeTab === "SETTINGS"
                            ? "bg-[#368F8B] text-white shadow-lg shadow-[#368F8B]/25"
                            : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-[#368F8B] dark:hover:text-[#45b1ac]"
                        }`}
                        onClick={() => toggle("SETTINGS")}
                      >
                        <UserIcon className="w-4.5 h-4.5 mr-2" />
                        Account Settings
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                          activeTab === "PASSWORD"
                            ? "bg-[#368F8B] text-white shadow-lg shadow-[#368F8B]/25"
                            : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-[#368F8B] dark:hover:text-[#45b1ac]"
                        }`}
                        onClick={() => toggle("PASSWORD")}
                      >
                        <ShieldCheck className="w-4.5 h-4.5 mr-2" />
                        Change Password
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                          activeTab === "MFA"
                            ? "bg-[#368F8B] text-white shadow-lg shadow-[#368F8B]/25"
                            : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-[#368F8B] dark:hover:text-[#45b1ac]"
                        }`}
                        onClick={() => toggle("MFA")}
                      >
                        <ShieldCheck className="w-4.5 h-4.5 mr-2" />
                        Two-Factor Auth
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="p-8 grow">
                  <div className="animate-in fade-in duration-500">
                    <SettingsTab isActive={activeTab === "SETTINGS"} />
                    <ChangePasswordTab isActive={activeTab === "PASSWORD"} />
                    <MFATab isActive={activeTab === "MFA"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
