"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface AdminDownload {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  accessLevel: string;
  category?: string;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState<AdminDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    accessLevel: "REGISTERED",
    category: "",
    tags: "",
  });

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setIsLoading(true);
      // Try simplified endpoint first, fallback to original
      let response = await fetch("/api/admin/downloads-simple");
      
      if (!response.ok || response.status === 404) {
        console.log("Simplified downloads endpoint not available, using fallback");
        response = await fetch("/api/admin/downloads");
      }
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("No tienes permisos de administrador");
          return;
        }
        if (response.status === 500) {
          toast.error("Error del servidor - intenta más tarde");
          return;
        }
        toast.error("Error loading downloads");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Admin downloads response is not JSON:", contentType, "Status:", response.status);
        toast.error("Error en formato de respuesta - servidor no disponible");
        return;
      }
      
      const data = await response.json();
      setDownloads(data.downloads || []);
    } catch (error) {
      toast.error("Error loading downloads");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file || !uploadData.title.trim()) {
      toast.error("File and title are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("accessLevel", uploadData.accessLevel);
      formData.append("category", uploadData.category);
      formData.append("tags", uploadData.tags);

      const response = await fetch("/api/admin/downloads", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setUploadData({ title: "", description: "", accessLevel: "REGISTERED", category: "", tags: "" });
        setShowUpload(false);
        form.reset();
        loadDownloads();
      } else {
        // Validate JSON response before parsing
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const data = await response.json();
            toast.error(data.error || "Error uploading file");
          } catch {
            toast.error("Error uploading file - respuesta inválida");
          }
        } else {
          console.error("Upload response is not JSON:", contentType, "Status:", response.status);
          if (response.status === 500) {
            toast.error("Error del servidor - intenta más tarde");
          } else {
            toast.error("Error uploading file");
          }
        }
      }
    } catch (error) {
      toast.error("Upload failed");
      console.error("Upload error:", error);
    }
  };

  const deleteDownload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/admin/downloads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File deleted successfully!");
        loadDownloads();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Delete error:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Downloads Management
        </h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showUpload ? "Cancel" : "Upload File"}
        </button>
      </div>

      {showUpload && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload New File
          </h3>
          
          <form onSubmit={uploadFile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File
              </label>
              <input
                type="file"
                name="file"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter file title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter file description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Level
              </label>
              <select
                value={uploadData.accessLevel}
                onChange={(e) => setUploadData({ ...uploadData, accessLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="REGISTERED">Registered Users</option>
                <option value="PRO">PRO Users Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter category..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={uploadData.tags}
                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="tag1, tag2, tag3..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              Upload File
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Downloads ({downloads.length})
          </h3>
        </div>

        {downloads.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No downloads available
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {downloads.map((download) => (
              <div key={download.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {download.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        download.accessLevel === "PRO"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      }`}>
                        {download.accessLevel}
                      </span>
                    </div>
                    
                    {download.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {download.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{download.fileName}</span>
                      <span>{formatFileSize(download.fileSize)}</span>
                      <span>{download.downloadCount} downloads</span>
                      <span>by {download.user.name || download.user.email}</span>
                      <span>{new Date(download.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {download.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {download.category}
                        </span>
                      </div>
                    )}
                    
                    {download.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {download.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <a
                      href={`/${download.filePath}`}
                      download={download.fileName}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => deleteDownload(download.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}