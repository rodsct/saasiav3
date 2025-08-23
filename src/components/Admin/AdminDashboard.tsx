"use client";

import { useState } from "react";
import AdminDownloads from "./AdminDownloads";
import WebhookConfig from "./WebhookConfig";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("downloads");

  const tabs = [
    { id: "downloads", label: "Downloads Management", icon: "📁" },
    { id: "webhooks", label: "Webhook Configuration", icon: "🔗" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage downloads and configure chatbot webhooks
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "downloads" && <AdminDownloads />}
          {activeTab === "webhooks" && <WebhookConfig />}
        </div>
      </div>
    </div>
  );
}