"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IMenuItem } from "@app/utils/menu";
import { useAppSelector } from "@app/store/store";

const MenuItem = ({ menuItem }: { menuItem: IMenuItem }) => {
  const [t] = useTranslation();
  const [isMenuExtended, setIsMenuExtended] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const [isMainActive, setIsMainActive] = useState(false);
  const [isOneOfChildrenActive, setIsOneOfChildrenActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const toggleMenu = () => {
    setIsMenuExtended(!isMenuExtended);
  };

  const handleMainMenuAction = () => {
    if (isExpandable) {
      toggleMenu();
      return;
    }
    router.push(menuItem.path ? menuItem.path : "/");
  };

  const calculateIsActive = (path: string) => {
    setIsMainActive(false);
    setIsOneOfChildrenActive(false);
    if (isExpandable && menuItem && menuItem.children) {
      menuItem.children.forEach((item) => {
        if (item.path === path) {
          setIsOneOfChildrenActive(true);
          setIsMenuExtended(true);
        }
      });
    } else if (menuItem.path === path) {
      setIsMainActive(true);
    }
  };

  useEffect(() => {
    if (pathname) {
      calculateIsActive(pathname);
    }
  }, [pathname, isExpandable, menuItem]);

  useEffect(() => {
    if (!isMainActive && !isOneOfChildrenActive) {
      setIsMenuExtended(false);
    }
  }, [isMainActive, isOneOfChildrenActive]);

  useEffect(() => {
    setIsExpandable(
      Boolean(menuItem && menuItem.children && menuItem.children.length > 0),
    );
  }, [menuItem]);

  // Dynamic Styles
  const linkBaseClasses =
    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors";

  const activeClasses = !darkMode
    ? "bg-[#368F8B] text-white shadow-lg shadow-[#368F8B]/30"
    : "bg-[#368F8B] text-white shadow-lg shadow-[#368F8B]/30";

  const inactiveClasses = !darkMode
    ? "text-gray-600 hover:bg-gray-100/50"
    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200";

  return (
    <li className={`relative w-full ${isMenuExtended ? "menu-open" : ""}`}>
      {isExpandable ? (
        <a
          className={`${linkBaseClasses} ${
            isMainActive || isOneOfChildrenActive
              ? activeClasses
              : inactiveClasses
          }`}
          role="link"
          onClick={handleMainMenuAction}
        >
          <i
            className={`${menuItem.icon} w-5 text-center text-lg ${
              isMainActive || isOneOfChildrenActive
                ? "text-white"
                : !darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
            }`}
          />
          <p className="flex-1 truncate font-medium text-sm tracking-wide">
            {t(menuItem.name)}
          </p>
          <i
            className={`fas fa-chevron-right text-xs transition-transform duration-200 ${
              isMenuExtended ? "rotate-90" : ""
            } ${
              isMainActive || isOneOfChildrenActive
                ? "text-white/70"
                : "opacity-50"
            }`}
          />
        </a>
      ) : (
        <Link
          href={menuItem.path || "#"}
          className={`${linkBaseClasses} ${
            isMainActive || isOneOfChildrenActive
              ? activeClasses
              : inactiveClasses
          }`}
        >
          <i
            className={`${menuItem.icon} w-5 text-center text-lg ${
              isMainActive || isOneOfChildrenActive
                ? "text-white"
                : !darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
            }`}
          />
          <p className="flex-1 truncate font-medium text-sm tracking-wide">
            {t(menuItem.name)}
          </p>
        </Link>
      )}

      {isExpandable && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isMenuExtended ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul
            className={`overflow-hidden pl-2 list-none space-y-0.5 border-l-2 ml-4 ${
              !darkMode ? "border-gray-100" : "border-gray-800"
            } ${isMenuExtended ? "mt-1 " : ""}`}
          >
            {menuItem.children?.map((item) => {
              const isActive = pathname === item.path;
              const fullLinkClass = `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                isActive
                  ? !darkMode
                    ? "bg-[#368F8B]/10 text-[#368F8B] font-medium"
                    : "bg-[#368F8B] text-white font-medium shadow-md shadow-[#368F8B]/20"
                  : !darkMode
                    ? "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`;
              return (
                <li key={item.name} className="relative w-full">
                  <Link className={fullLinkClass} href={item.path || "#"}>
                    <i
                      className={`${item.icon} w-4 text-center text-xs opacity-70`}
                    />
                    <p className="flex-1 truncate">{t(item.name)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

export default MenuItem;
