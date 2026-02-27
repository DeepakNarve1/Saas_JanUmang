"use client";
import { useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toggleSidebarMenu } from "@app/store/reducers/ui";
import UserDropdown from "@app/modules/main/header/user-dropdown/UserDropdown";
import LanguagesDropdown from "@app/modules/main/header/languages-dropdown/LanguagesDropdown";
import Image from "@app/components/Image";
import { useAppDispatch, useAppSelector } from "@app/store/store";
import { Users, Home } from "lucide-react";
import TenantSwitcher from "./tenant-switcher/TenantSwitcher";

import ThemeToggle from "@app/components/common/ThemeToggle";

const Header = ({ containered, ...rest }: { containered?: boolean } & any) => {
  const [t] = useTranslation();
  const dispatch = useAppDispatch();
  const navbarVariant = useAppSelector((state) => state.ui.navbarVariant);
  const headerBorder = useAppSelector((state) => state.ui.headerBorder);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  const getContainerClasses = useCallback(() => {
    let classes = `main-header fixed top-0 h-[57px] flex items-center justify-between px-4 z-[1034] transition-all duration-300 ease-in-out ${navbarVariant}`;

    if (!darkMode) {
      classes += " bg-white border-b border-gray-200";
    } else {
      classes += " !bg-[#17181A] border-b !border-gray-800";
    }

    if (headerBorder) {
      classes = `${classes} border-b-0`;
    }
    return classes;
  }, [navbarVariant, headerBorder, darkMode]);

  return (
    <nav id="main-header" className={getContainerClasses()} {...rest}>
      <div
        className={`w-full flex items-center justify-between ${
          containered ? "container mx-auto" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          {topNavigation && (
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-[#368F8B] to-[#2d7a76] shadow-md shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-black/90 dark:text-white/90">
                  JAN UMANG
                </span>
              </Link>
              <button
                className="p-2 border rounded md:hidden dark:border-gray-700"
                type="button"
                data-toggle="collapse"
                data-target="#navbarCollapse"
              >
                <i className="fas fa-bars dark:text-gray-300" />
              </button>
            </div>
          )}

          <ul className="flex list-none gap-2 m-0 p-0 items-center">
            {!topNavigation && (
              <li>
                <button
                  onClick={handleToggleMenuSidebar}
                  type="button"
                  className="p-2 text-gray-500 hover:text-[#2e7875] dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-bars" />
                </button>
              </li>
            )}
            <li className="hidden sm:block">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#2e7875] font-bold dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Home className="w-4 h-4" />
                <span>{t("header.label.home")}</span>
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link
                href="/profile"
                className="block px-3 py-2 text-gray-500 hover:text-[#2e7875] font-bold dark:text-gray-400 dark:hover:text-gray-200"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <ul
          id="user-dropdown"
          className="flex list-none gap-4 m-0 p-0 items-center ml-auto"
        >
          <li>
            <TenantSwitcher />
          </li>
          <li>
            <LanguagesDropdown />
          </li>
          <li>
            <ThemeToggle />
          </li>
          <UserDropdown />
        </ul>
      </div>
    </nav>
  );
};

export default Header;
