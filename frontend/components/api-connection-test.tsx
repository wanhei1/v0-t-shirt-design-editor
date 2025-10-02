"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function ApiConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "testing" | "connected" | "failed";
    message: string;
    data?: any;
  }>({
    status: "testing",
    message: "Testing connection...",
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus({
        status: "testing",
        message: "Testing connection...",
      });

      const result = await apiClient.testConnection();

      if (result.success) {
        setConnectionStatus({
          status: "connected",
          message: "Successfully connected to backend!",
          data: result.data,
        });
      } else {
        setConnectionStatus({
          status: "failed",
          message: `Connection failed: ${result.error}`,
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: "failed",
        message: `Connection failed: ${error.message}`,
      });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case "testing":
        return "text-yellow-600";
      case "connected":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case "testing":
        return "⏳";
      case "connected":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="border rounded-lg p-4 m-4 bg-white shadow">
      <h3 className="text-lg font-semibold mb-2">Backend Connection Status</h3>

      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        <span className="text-xl">{getStatusIcon()}</span>
        <span className="font-medium">{connectionStatus.message}</span>
      </div>

      {connectionStatus.data && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
          <pre>{JSON.stringify(connectionStatus.data, null, 2)}</pre>
        </div>
      )}

      <button
        onClick={testConnection}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Connection Again
      </button>
    </div>
  );
}
