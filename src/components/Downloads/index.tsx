"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import DownloadsGrid from "./DownloadsGrid";
import AdminUpload from "./AdminUpload";

export default function Downloads() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const isAdmin = user?.role === "ADMIN";
  const isPro = user?.subscription === "PRO";

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-[#2f2f2f]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-[#3f3f3f] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            {t('downloads.login_required')}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('downloads.login_message')}
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
              <span>{t('downloads.registered_resources')}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{t('downloads.premium_content')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f2f2f] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#ff6b35] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {t('downloads.title')}
              </h1>
              <p className="text-sm md:text-base text-gray-400">
                {t('downloads.subtitle')}
              </p>
            </div>
          </div>
          
          {/* User Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#3f3f3f] rounded-full">
              <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-purple-500' : 'bg-[#ff6b35]'}`}></div>
              <span className="text-sm text-gray-300">
                {isPro ? t('downloads.access_levels.pro') : t('downloads.access_levels.registered')}
              </span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-400">
                  {t('navigation.admin')}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Admin Upload Section */}
      {isAdmin && (
        <div className="mb-8">
          <AdminUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

        {/* Downloads Grid */}
        <DownloadsGrid 
          key={refreshKey} 
          showAdminControls={isAdmin} 
        />
      </div>
    </div>
  );
}