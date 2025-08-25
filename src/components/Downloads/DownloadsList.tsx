"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Download {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  createdAt: string;
}

interface DownloadsListProps {
  refreshTrigger: number;
}

export default function DownloadsList({ refreshTrigger }: DownloadsListProps) {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDownloads();
    }
  }, [user, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDownloads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/downloads");
      const data = await response.json();
      
      if (response.ok) {
        setDownloads(data.downloads);
      } else {
        toast.error("Error loading downloads");
      }
    } catch (error) {
      toast.error("Error loading downloads");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadFile = async (download: Download) => {
    try {
      const response = await fetch(`/${download.filePath}`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = download.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
      console.error("Download error:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view downloads</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Downloads ({downloads.length})
        </h3>
      </div>

      {downloads.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No downloads available yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {downloads.map((download) => (
            <div key={download.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      {download.title}
                    </h4>
                    {download.isPublic && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Public
                      </span>
                    )}
                  </div>
                  
                  {download.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {download.description}
                    </p>
                  )}
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{download.fileName}</span>
                    <span>{formatFileSize(download.fileSize)}</span>
                    <span>{new Date(download.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => downloadFile(download)}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}