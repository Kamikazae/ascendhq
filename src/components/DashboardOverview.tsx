"use client";
import { useEffect, useState } from "react";
import { Users, Target, BarChart3, TrendingUp, Activity } from "lucide-react";

export default function DashboardOverview({}) {
  const [stats, setStats] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topObjectives, setTopObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard/dashboardoverview");
        const data = await res.json();
        console.log("Dashboard API Response:", data);

        if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard data");

        setStats([
          { label: "Total Objectives", value: data.totalObjectives, icon: Target, color: "bg-blue-100 text-blue-600" },
          { label: "Key Results", value: data.totalKeyResults, icon: BarChart3, color: "bg-green-100 text-green-600" },
          { label: "Progress", value: `${data.avgProgress}%`, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
          { label: "Team Members", value: data.teamMembersCount, icon: Users, color: "bg-orange-100 text-orange-600" },
        ]);

        setProgressData(data.progressOverTime ?? []);
        setActivities(data.recentActivity ?? []);
        setTopObjectives(data.topPerformingObjectives ?? []);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
        <div className="flex items-end gap-4 h-40">
          {progressData.map((point) => (
            <div key={point.date} className="flex flex-col items-center flex-1">
              <div className="bg-blue-500 w-full rounded-t" style={{ height: `${point.count * 10}%` }}></div>
              <span className="text-sm mt-2">{point.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-3">
          {activities.map((act) => (
            <li key={act.id} className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm">
                  {act.user?.name} updated <strong>{act.keyResult?.title}</strong> — {act.comment}
                </p>
                <span className="text-xs text-gray-500">{new Date(act.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Performing Objectives */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Top Performing Objectives</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Objective</th>
              <th className="py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {topObjectives.map((obj) => (
              <tr key={obj.id} className="border-b">
                <td className="py-2">{obj.title}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${obj.avgProgress}%` }}></div>
                    </div>
                    <span>{obj.avgProgress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
