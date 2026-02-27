"use client";

import React, { useEffect } from "react";

const ContentHeader = ({ title }: { title: string | React.ReactNode }) => {
  useEffect(() => {
    if (typeof title === "string") {
      document.title = `${title} | Jan Umang`;
    }
  }, [title]);

  return (
    <section className="content-header pt-6 pb-2">
      <div className="container-fluid px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100 transition-colors">
            {title}
          </h1>
          {/* Breadcrumbs could go here if needed later */}
        </div>
      </div>
    </section>
  );
};

export default ContentHeader;
