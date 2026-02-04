import React from 'react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-b-indigo-600 animate-spin-reverse"></div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800">Loading Salon CRM</h3>
          <p className="text-gray-500 text-sm">Preparing your workspace...</p>
          <div className="h-1 w-48 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}