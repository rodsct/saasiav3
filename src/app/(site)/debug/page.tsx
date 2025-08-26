"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface DebugUser {
  id: string;
  email: string;
  name: string;
  role: string;
  subscription: string;
  subscriptionEndsAt?: string;
  createdAt: string;
}

export default function DebugPage() {
  const { user, isLoading } = useAuth();
  const [debugData, setDebugData] = useState<{
    authenticated: boolean;
    user?: DebugUser;
    isAdmin: boolean;
  } | null>(null);

  const checkUserStatus = async () => {
    try {
      const response = await fetch("/api/debug/user");
      if (response.ok) {
        const data = await response.json();
        setDebugData(data);
      } else {
        toast.error("Error checking user status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error checking user status");
    }
  };

  const promoteToAdmin = async () => {
    try {
      const response = await fetch("/api/debug/user", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        checkUserStatus();
        // Refresh the page to update auth context
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Error promoting user");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error promoting user");
    }
  };

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please log in first</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Debug User Status</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Auth Hook Data:</h2>
        <pre className="bg-gray-900 p-4 rounded text-sm text-green-400 overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {debugData && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Database Data:</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm text-green-400 overflow-x-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={checkUserStatus}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Refresh User Status
        </button>

        {debugData && !debugData.isAdmin && (
          <button
            onClick={promoteToAdmin}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Promote to ADMIN
          </button>
        )}
      </div>

      <div className="mt-8 bg-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-200 mb-2">Debug Steps:</h3>
        <ol className="text-yellow-100 text-sm space-y-1">
          <li>1. Check if user data matches between auth hook and database</li>
          <li>2. Verify user role in database</li>
          <li>3. If needed, promote user to ADMIN using the button above</li>
          <li>4. Test admin panel access after promotion</li>
        </ol>
      </div>
    </div>
  );
}