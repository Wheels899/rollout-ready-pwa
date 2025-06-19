"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // Hide status after 3 seconds
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className={`transition-all duration-300 ${
          isOnline 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isOnline ? "Back Online" : "Offline"}
        </div>
      </Badge>
    </div>
  );
}
