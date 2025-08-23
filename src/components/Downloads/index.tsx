"use client";

import { useState } from "react";
import UploadForm from "./UploadForm";
import DownloadsList from "./DownloadsList";

export default function Downloads() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Downloads
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and access your downloadable files
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="lg:col-span-2">
          <DownloadsList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}