import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, TrendingUp, Play } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

import { analyticsService } from "../../services/analytics";

import { StatCard } from "../common/StatCard";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

import { Button } from "../common/Button";

export const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardAnalytics();
  }, []);

  const loadDashboardAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsService.getDashboardAnalytics();

      if (response.success) {
        setAnalytics(response.data.analytics);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error loading dashboard analytics:", err);
      setError(err.message || "Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardAnalytics();
  };

  const getRoleBasedGreeting = () => {
    const greetings = {
      admin: `Welcome back, ${user.name}! Here's your system overview.`,
      manager: `Welcome back, ${user.name}! Here's your ${user.department} department overview.`,
      user: `Welcome back, ${user.name}! Here's your personal overview.`,
    };
    return greetings[user.role] || `Welcome back, ${user.name}!`;
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <StatCard key={index} loading={true} />
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getRoleBasedGreeting()}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics?.cards && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.cards.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                color={card.color}
                icon={card.icon}
                change={card.change}
                changeType={card.changeType}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Summary Section for Admins */}
        {user.role === "admin" && analytics?.summary && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              System Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {analytics.summary.totalUsers}
                </div>
                <div className="text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {analytics.summary.activeUsers}
                </div>
                <div className="text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">
                  {analytics.summary.totalTickets}
                </div>
                <div className="text-gray-500">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-yellow-600">
                  {analytics.summary.openTickets}
                </div>
                <div className="text-gray-500">Open Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600">
                  {analytics.summary.overdueTickets}
                </div>
                <div className="text-gray-500">Overdue Items</div>
              </div>
            </div>
          </div>
        )}

        {/* Department Summary for Managers */}
        {user.role === "manager" && analytics?.summary && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {analytics.summary.department} Department Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {analytics.summary.departmentUsers}
                </div>
                <div className="text-gray-500">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">
                  {analytics.summary.departmentTickets}
                </div>
                <div className="text-gray-500">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {analytics.summary.resolvedDepartmentTickets}
                </div>
                <div className="text-gray-500">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600">
                  {analytics.summary.overdueDepartmentTickets}
                </div>
                <div className="text-gray-500">Overdue</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <QuickActions />
        </div>

        {/* Error Message */}
        {error && analytics && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Warning</p>
                <p>Some data may be outdated: {error}</p>
                <button
                  onClick={handleRefresh}
                  className="underline hover:no-underline mt-1"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
