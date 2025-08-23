"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CHATBOT_MODELS, ChatbotModelConfig } from "@/utils/chatbotModels";

export default function WebhookConfig() {
  const [models, setModels] = useState<ChatbotModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/webhooks");
      const data = await response.json();
      
      if (response.ok) {
        setModels(data.models);
      } else {
        toast.error("Error loading webhook configurations");
      }
    } catch (error) {
      toast.error("Error loading webhook configurations");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (model: ChatbotModelConfig) => {
    setEditingModel(model.id);
    setWebhookUrl(model.webhookUrl);
  };

  const cancelEdit = () => {
    setEditingModel(null);
    setWebhookUrl("");
  };

  const saveWebhook = async (modelId: string) => {
    try {
      const response = await fetch("/api/admin/webhooks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          webhookUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Webhook updated successfully!");
        setEditingModel(null);
        setWebhookUrl("");
        loadModels();
      } else {
        toast.error(data.error || "Failed to update webhook");
      }
    } catch (error) {
      toast.error("Failed to update webhook");
      console.error("Error:", error);
    }
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Webhook Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage n8n webhook URLs for different chatbot models
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chatbot Models
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {models.map((model) => (
            <div key={model.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {model.description}
                  </p>
                  
                  {editingModel === model.id ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter webhook URL..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveWebhook(model.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {model.webhookUrl}
                      </code>
                    </div>
                  )}
                </div>

                {editingModel !== model.id && (
                  <button
                    onClick={() => startEdit(model)}
                    className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}