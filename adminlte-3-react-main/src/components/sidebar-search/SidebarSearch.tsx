"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { IMenuItem, MENU } from "@app/utils/menu";

export const SidebarSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [foundMenuItems, setFoundMenuItems] = useState<IMenuItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setFoundMenuItems([]);
    if (searchText) {
      setFoundMenuItems(findMenuItems(MENU));
    } else {
      setSearchText("");
      setFoundMenuItems([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (foundMenuItems && foundMenuItems.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [foundMenuItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = () => {
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const findMenuItems = (
    menuItems: IMenuItem[],
    results: IMenuItem[] = []
  ): IMenuItem[] => {
    for (const menuItem of menuItems) {
      if (
        menuItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
        menuItem.path
      ) {
        results.push(menuItem);
      }
      if (menuItem.children) {
        findMenuItems(menuItem.children, results);
      }
    }
    return results;
  };

  const boldString = (str: string, substr: string) => {
    const reg = new RegExp(`(${substr})`, "gi");
    return str.replace(reg, '<strong class="text-white">$1</strong>');
  };

  return (
    <div className="relative w-full px-3 mb-3" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-white border-gray-300 text-gray-900 border rounded-lg py-3 pl-10 pr-4 text-sm shadow-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00563B]/50 focus:shadow-lg transition-all duration-200"
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute left-3 right-3 mt-1 bg-[#2c4a59] rounded shadow-lg z-1000 border border-gray-600 max-h-60 overflow-y-auto">
          {foundMenuItems.length === 0 ? (
            <div className="px-4 py-2 text-gray-400 text-sm italic">
              No Element found
            </div>
          ) : (
            <div className="py-1">
              {foundMenuItems.map((menuItem: any) => (
                <Link
                  key={menuItem.name + menuItem.path}
                  href={menuItem.path}
                  onClick={handleMenuItemClick}
                  className="block px-4 py-2 text-gray-300 hover:bg-[#343a40] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    {menuItem.icon && (
                      <i className={`${menuItem.icon} text-xs`} />
                    )}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: boldString(menuItem.name, searchText),
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    {menuItem.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
