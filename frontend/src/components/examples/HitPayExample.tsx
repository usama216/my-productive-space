'use client';

import { useState } from 'react';
import { useHitPay } from '@/hooks/useHitPay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HitPayPaymentRequest } from '@/types/hitpay';

export function HitPayExample() {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  
  const {
    createPayment,
    getPaymentStatus,
    getTransactions,
    getUserProfile,
    isLoading,
    error,
  } = useHitPay();

  // Example payment data
  const handleCreatePayment = async () => {
    const paymentData: HitPayPaymentRequest = {
      amount: parseFloat(amount),
      currency: 'SGD',
      reference_number: reference,
      redirect_url: `${window.location.origin}/payment-success`,
      webhook: `${window.location.origin}/api/webhook/hitpay`,
      name: 'Customer Name',
      email: email,
      purpose: 'Product Purchase',
      send_sms: false,
      send_email: true,
    };

    const result = await createPayment(paymentData);
    
    if (result.success) {
      console.log('Payment created:', result.data);
      // Redirect to payment page or show success message
    } else {
      console.error('Payment failed:', result.error);
    }
  };

  // Example of using queries
  const { data: userProfile, isLoading: profileLoading } = getUserProfile();
  const { data: transactions, isLoading: transactionsLoading } = getTransactions();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>HitPay Payment Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (SGD)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reference Number</label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="REF123456"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <Button 
            onClick={handleCreatePayment}
            disabled={!amount || !reference || !email || isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating Payment...' : 'Create Payment'}
          </Button>

          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.toString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Display */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div>Loading profile...</div>
          ) : userProfile ? (
            <div className="space-y-2">
              <div><strong>Email:</strong> {userProfile.email}</div>
              <div><strong>Name:</strong> {userProfile.name || 'N/A'}</div>
              <div><strong>Phone:</strong> {userProfile.phone || 'N/A'}</div>
              <div><strong>Country:</strong> {userProfile.country || 'N/A'}</div>
            </div>
          ) : (
            <div>No profile data available</div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Display */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div>Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">${transaction.amount} {transaction.currency}</div>
                      <div className="text-sm text-gray-600">{transaction.reference_number}</div>
                    </div>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No transactions found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
