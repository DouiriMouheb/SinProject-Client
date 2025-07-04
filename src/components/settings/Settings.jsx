import React from "react";

export const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">
          System settings and configuration options would be implemented here.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Only administrators can access this section.
        </p>
      </div>
    </div>
  );
};
