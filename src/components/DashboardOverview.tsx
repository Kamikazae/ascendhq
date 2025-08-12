// src/components/DashboardOverview.tsx
import { useState } from "react";
import {
  Users,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function DashboardOverview() {
  const [stats] = useState([
    { label: "Total Objectives", value: 12, icon: Target, color: "bg-blue-100 text-blue-600" },
    { label: "Key Results", value: 45, icon: BarChart3, color: "bg-green-100 text-green-600" },
    { label: "Progress", value: "78%", icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
    { label: "Team Members", value: 18, icon: Users, color: "bg-orange-100 text-orange-600" },
  ]);

  const [progressData] = useState([
    { month: "Jan", progress: 20 },
    { month: "Feb", progress: 35 },
    { month: "Mar", progress: 50 },
    { month: "Apr", progress: 65 },
    { month: "May", progress: 78 },
  ]);

  const [activities] = useState([
    { id: 1, text: "John updated Objective #3 progress to 80%", time: "2 hours ago" },
    { id: 2, text: "Anna added a new Key Result for Objective #5", time: "5 hours ago" },
    { id: 3, text: "Mark completed Key Result #2", time: "Yesterday" },
  ]);

  const [topObjectives] = useState([
    { id: 1, name: "Increase Q1 Sales", progress: 92 },
    { id: 2, name: "Improve Customer Retention", progress: 88 },
    { id: 3, name: "Launch New Product Line", progress: 85 },
  ]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white shadow rounded-lg p-4 flex items-center gap-4"
          >
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

      {/* Progress Chart (mock, no chart lib yet) */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
        <div className="flex items-end gap-4 h-40">
          {progressData.map((point) => (
            <div key={point.month} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-full rounded-t"
                style={{ height: `${point.progress}%` }}
              ></div>
              <span className="text-sm mt-2">{point.month}</span>
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
                <p className="text-sm">{act.text}</p>
                <span className="text-xs text-gray-500">{act.time}</span>
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
                <td className="py-2">{obj.name}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${obj.progress}%` }}
                      ></div>
                    </div>
                    <span>{obj.progress}%</span>
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
