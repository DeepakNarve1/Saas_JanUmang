"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@app/store/store";
import { toggleDarkMode } from "@app/store/reducers/ui";
import { Button } from "@app/components/ui/button";

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
