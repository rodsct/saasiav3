"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type AccessLevel = "PUBLIC" | "REGISTERED" | "PREMIUM";

interface UploadFormData {
  title: string;
  description: string;
  accessLevel: AccessLevel;
  category: string;
  tags: string;
}

export default function AdminUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    accessLevel: "PUBLIC",
    category: "",
    tags: "",
  });

  const accessLevelOptions = [
    { value: "PUBLIC", label: "Público", description: "Visible para todos los visitantes" },
    { value: "REGISTERED", label: "Registrados", description: "Solo usuarios registrados" },
    { value: "PREMIUM", label: "Premium", description: "Solo usuarios premium" }
  ];

  const categories = [
    "Documentos",
    "Plantillas", 
    "Guías",
    "Software",
    "Recursos",
    "Manuales",
    "Otros"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: selectedFile.name.split('.').slice(0, -1).join('.')
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("title", formData.title);
    uploadFormData.append("description", formData.description);
    uploadFormData.append("accessLevel", formData.accessLevel);
    uploadFormData.append("category", formData.category);
    uploadFormData.append("tags", formData.tags);

    try {
      const response = await fetch("/api/admin/downloads", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        toast.success("Archivo subido exitosamente");
        setIsOpen(false);
        setFile(null);
        setFormData({
          title: "",
          description: "",
          accessLevel: "PUBLIC",
          category: "",
          tags: "",
        });
        onUploadSuccess();
      } else {
        // Validate JSON response before parsing
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const error = await response.json();
            toast.error(error.error || "Error al subir archivo");
          } catch {
            toast.error("Error al subir archivo - respuesta inválida");
          }
        } else {
          console.error("Upload response is not JSON:", contentType, "Status:", response.status);
          if (response.status === 500) {
            toast.error("Error del servidor - intenta más tarde");
          } else {
            toast.error("Error al subir archivo");
          }
        }
      }
    } catch (error) {
      toast.error("Error al subir archivo");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Subir Archivo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subir Nuevo Archivo
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Archivo *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.png,.jpg,.jpeg,.gif"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {file ? file.name : "Seleccionar archivo"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, TXT, ZIP, imágenes"}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del archivo para mostrar"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del archivo"
            />
          </div>

          {/* Access Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Nivel de Acceso *
            </label>
            <div className="space-y-3">
              {accessLevelOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="accessLevel"
                    value={option.value}
                    checked={formData.accessLevel === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value as AccessLevel }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiquetas
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Separar con comas: diseño, marketing, plantilla"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Las etiquetas ayudan a los usuarios a encontrar el archivo más fácilmente
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isUploading || !file || !formData.title}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold shadow-lg transition-all duration-200"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subiendo...
                </div>
              ) : (
                "Subir Archivo"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}