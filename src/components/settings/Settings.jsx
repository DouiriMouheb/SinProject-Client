import React from "react";

export const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Settings
      </h1>
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-400">
          System settings and configuration options would be implemented here.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Only administrators can access this section.
        </p>
      </div>
    </div>
  );
};
