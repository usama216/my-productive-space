// src/hooks/usePackages.ts
import { useState, useEffect, useCallback } from 'react';
import { packagesApi, Package, UserPackage, UserPass, PurchaseHistory } from '@/lib/api/packages';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPackages = await packagesApi.getAllPackages();
      setPackages(fetchedPackages);
    } catch (err) {
      console.error('Error fetching packages:', err);
      
      // Fallback to hardcoded packages if API fails
      console.log('Falling back to hardcoded packages');
      const fallbackPackages: Package[] = [
        {
          id: 'half-day-productivity-boost',
          name: 'Half-Day Productivity Boost',
          description: 'Perfect for focused work sessions',
          price: 25,
          outletFee: 5,
          type: 'cowork',
          duration: '4 hours',
          features: ['High-speed WiFi', 'Ergonomic seating', 'Quiet environment'],
          isPopular: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'full-day-productivity-suite',
          name: 'Full-Day Productivity Suite',
          description: 'Complete workspace solution for extended work',
          price: 45,
          outletFee: 8,
          type: 'cowork',
          duration: '8 hours',
          features: ['High-speed WiFi', 'Ergonomic seating', 'Quiet environment', 'Meeting room access'],
          isPopular: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bonus-hours-bundle',
          name: 'Bonus Hours Bundle',
          description: 'Additional hours for your existing package',
          price: 15,
          outletFee: 3,
          type: 'cowork',
          duration: '2 hours',
          features: ['High-speed WiFi', 'Ergonomic seating'],
          isPopular: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setPackages(fallbackPackages);
      setError('Using fallback packages - Backend API unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get package by ID
  const getPackageById = useCallback(async (id: string): Promise<Package | null> => {
    try {
      setError(null);
      const packageData = await packagesApi.getPackageById(id);
      return packageData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch package');
      console.error('Error fetching package:', err);
      return null;
    }
  }, []);

  // Initialize packages on mount
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Add retry functionality
  const retryFetch = useCallback(() => {
    console.log('Retrying package fetch...');
    fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    loading,
    error,
    fetchPackages,
    getPackageById,
    retryFetch,
  };
};

export const useUserPackages = (userId: string | undefined) => {
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user packages
  const fetchUserPackages = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedPackages = await packagesApi.getUserPackages(userId);
      setUserPackages(fetchedPackages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user packages');
      console.error('Error fetching user packages:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch user passes
  const fetchUserPasses = useCallback(async (): Promise<UserPass[]> => {
    if (!userId) return [];
    
    try {
      setError(null);
      const passes = await packagesApi.getUserPasses(userId);
      return passes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user passes');
      console.error('Error fetching user passes:', err);
      return [];
    }
  }, [userId]);

  // Fetch purchase history
  const fetchPurchaseHistory = useCallback(async (): Promise<PurchaseHistory[]> => {
    if (!userId) return [];
    
    try {
      setError(null);
      const history = await packagesApi.getUserPurchaseHistory(userId);
      return history;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase history');
      console.error('Error fetching purchase history:', err);
      return [];
    }
  }, [userId]);

  // Initialize user packages on mount or userId change
  useEffect(() => {
    if (userId) {
      fetchUserPackages();
    }
  }, [userId, fetchUserPackages]);

  return {
    userPackages,
    loading,
    error,
    fetchUserPackages,
    fetchUserPasses,
    fetchPurchaseHistory,
  };
};

export const usePackagePurchase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initiate package purchase
  const initiatePurchase = useCallback(async (purchaseData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await packagesApi.initiatePurchase(purchaseData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase initiation failed');
      console.error('Error initiating purchase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm package purchase
  const confirmPurchase = useCallback(async (userPackageId: string, hitpayReference: string, paymentStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await packagesApi.confirmPurchase(userPackageId, hitpayReference, paymentStatus);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase confirmation failed');
      console.error('Error confirming purchase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get purchase status
  const getPurchaseStatus = useCallback(async (orderId: string) => {
    try {
      setError(null);
      const result = await packagesApi.getPurchaseStatus(orderId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get purchase status');
      console.error('Error getting purchase status:', err);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    initiatePurchase,
    confirmPurchase,
    getPurchaseStatus,
  };
};
