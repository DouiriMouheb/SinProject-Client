import React from "react";

export const QuickActions = () => {
  const actions = [
    {
      label: "Create New Ticket",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700",
    },

    {
      label: "Schedule Meeting",
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${action.color}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
