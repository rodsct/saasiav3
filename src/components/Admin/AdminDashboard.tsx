"use client";

import { useState } from "react";
import AdminDownloads from "./AdminDownloads";
import WebhookConfig from "./WebhookConfig";
import AdminOverview from "./AdminOverview";
import PricingManagement from "./PricingManagement";
import PromotionsManagement from "./PromotionsManagement";
import UserManagement from "./UserManagement";
import WhatsAppConfig from "./WhatsAppConfig";
import EmailTemplatesManagement from "./EmailTemplatesManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Panel General", shortLabel: "General", icon: "📊" },
    { id: "pricing", label: "Gestión de Precios", shortLabel: "Precios", icon: "💰" },
    { id: "promotions", label: "Promociones", shortLabel: "Promos", icon: "🎁" },
    { id: "users", label: "Usuarios", shortLabel: "Users", icon: "👥" },
    { id: "downloads", label: "Descargas", shortLabel: "Files", icon: "📁" },
    { id: "webhooks", label: "Webhooks", shortLabel: "API", icon: "🔗" },
    { id: "whatsapp", label: "WhatsApp", shortLabel: "WhatsApp", icon: "📱" },
    { id: "emails", label: "Plantillas Email", shortLabel: "Email", icon: "📧" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 xl:py-16 max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-10">
          <div className="flex items-center justify-between">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
                Panel de Administración
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                Gestiona el contenido, usuarios y configuración de tu plataforma SaaS
              </p>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm"
            >
              <span className="text-xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
              <span className="text-xs block text-gray-600 dark:text-gray-400 mt-1">
                {tabs.find(t => t.id === activeTab)?.shortLabel}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
          {/* Desktop Navigation */}
          <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap justify-center xl:justify-start gap-2 p-4 bg-gray-50 dark:bg-gray-900/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 min-w-fit ${
                    activeTab === tab.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden xl:inline">{tab.label}</span>
                  <span className="xl:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                        activeTab === tab.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span className="text-2xl mb-1">{tab.icon}</span>
                      <span className="text-xs font-medium text-center">{tab.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile breadcrumb */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tabs.find(t => t.id === activeTab)?.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="max-w-7xl mx-auto">
              {activeTab === "overview" && <AdminOverview />}
              {activeTab === "pricing" && <PricingManagement />}
              {activeTab === "promotions" && <PromotionsManagement />}
              {activeTab === "users" && <UserManagement />}
              {activeTab === "downloads" && <AdminDownloads />}
              {activeTab === "webhooks" && <WebhookConfig />}
              {activeTab === "whatsapp" && <WhatsAppConfig />}
              {activeTab === "emails" && <EmailTemplatesManagement />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}