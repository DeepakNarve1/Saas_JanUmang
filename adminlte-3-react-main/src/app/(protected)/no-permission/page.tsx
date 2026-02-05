"use client";
import { ContentHeader } from "@app/components";
import { Lock } from "lucide-react";

export default function NoPermissionPage() {
  return (
    <>
      <ContentHeader title="Access Denied" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Lock className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          No Permissions Assigned
        </h2>
        <p className="text-gray-600 max-w-md mb-8 text-lg">
          Your account has been created, but no permissions have been assigned
          yet. Please contact your system administrator to request access to
          modules.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Check Again
        </button>
      </div>
    </>
  );
}
