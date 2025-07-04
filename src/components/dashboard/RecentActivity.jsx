// src/components/dashboard/RecentActivity.jsx - Updated with ProfilePicture integration
import React, { useState, useEffect } from "react";
import { RefreshCw, Activity, Clock } from "lucide-react";
import { analyticsService } from "../../services/analytics";
import { ProfilePicture } from "../common/ProfilePicture";
import { Button } from "../common/Button";

export const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsService.getRecentActivity(8);

      if (response.success) {
        setActivities(response.data.activities || []);
      }
    } catch (err) {
      console.error("Error loading recent activity:", err);
      setError(err.message || "Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (status) => {
    const colors = {
      resolved: "bg-green-400",
      "in-progress": "bg-blue-400",
      open: "bg-yellow-400",
      closed: "bg-gray-400",
    };
    return colors[status] || "bg-blue-400";
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown time";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return "Unknown time";
    }
  };

  const handleRefresh = () => {
    loadRecentActivity();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && activities.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex items-center text-sm"
            >
              <div className="w-2 h-2 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500 mb-3">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex items-start text-sm"
            >
              <div
                className={`w-2 h-2 ${getActivityColor(
                  activity.status
                )} rounded-full mr-3 mt-2 flex-shrink-0`}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 truncate">{activity.message}</p>
                <div className="flex items-center text-gray-400 text-xs mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTimeAgo(activity.time)}</span>
                  {activity.user && (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        {/* Show ProfilePicture if user object has profile data */}
                        {typeof activity.user === "object" ? (
                          <>
                            <ProfilePicture
                              user={activity.user}
                              size="xs"
                              className="mr-1"
                            />
                            <span>{activity.user.name}</span>
                          </>
                        ) : (
                          <span>{activity.user}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
