'use client';

import { useState } from 'react';
import { generateOpenLink, GenerateOpenLinkResponse } from '@/lib/doorService';
import { useToast } from '@/hooks/use-toast';

export default function OpenDoorExample() {
  const { toast } = useToast();
  const [bookingRef, setBookingRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateOpenLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    if (!bookingRef.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateOpenLink(bookingRef.trim());
      setResult(response);
      
      if (!response.success) {
        setError(response.message || 'Failed to generate access link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (result?.data?.accessPath) {
      navigator.clipboard.writeText(result.data.accessPath);
      toast({
        title: "Link Copied!",
        description: "Access link has been copied to clipboard.",
      });
    }
  };

  const handleOpenLink = () => {
    if (result?.data?.accessPath) {
      window.open(result.data.accessPath, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate Door Access Link</h2>
      
      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="bookingRef" className="block text-sm font-medium text-gray-700 mb-2">
          Booking Reference
        </label>
        <input
          id="bookingRef"
          type="text"
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          placeholder="Enter your booking reference"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateLink}
        disabled={isLoading || !bookingRef.trim()}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Access Link'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Success Result */}
      {result?.success && result.data && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Access Link Generated Successfully!</h3>
          
          {/* Access Path */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Link:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={result.data.accessPath}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy
              </button>
              <button
                onClick={handleOpenLink}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Open
              </button>
            </div>
          </div>

          {/* Additional Info */}
          {/* <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Booking Reference:</span> {result.data.bookingRef}
            </div>
            <div>
              <span className="font-medium">Valid From:</span> {new Date(result.data.enable_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Expires At:</span> {new Date(result.data.expiresAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Access Count:</span> {result.data.currentAccessCount}
              {result.data.maxAccessCount && ` / ${result.data.maxAccessCount}`}
              {result.data.unlimitedAccess && ' (Unlimited)'}
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
