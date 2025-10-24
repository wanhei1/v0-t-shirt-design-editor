'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface MembershipStatus {
  has_membership: boolean;
  membership_type?: string;
  designs_quota?: number;
  designs_used?: number;
  expires_at?: string;
}

const MEMBERSHIP_TIERS = [
  {
    type: 'quarterly',
    name: 'Quarterly',
    price: 188,
    designs: 3,
    duration: '3 months',
    description: '3 design uploads per quarter',
    features: ['3 design uploads', '3 months validity', 'Basic support'],
  },
  {
    type: 'half_year',
    name: 'Half Year',
    price: 1068,
    designs: 6,
    duration: '6 months',
    description: '6 design uploads per 6 months',
    features: ['6 design uploads', '6 months validity', 'Priority support', '5% commission discount'],
    recommended: true,
  },
  {
    type: 'annual',
    name: 'Annual',
    price: 2016,
    designs: 12,
    duration: '12 months',
    description: '12 design uploads per year',
    features: ['12 design uploads', '12 months validity', 'Priority support', '10% commission discount', 'Exclusive analytics'],
  },
];

export function MembershipPurchase() {
  const { user } = useAuth();
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 获取会员状态
  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getMembershipStatus() as unknown as { data?: MembershipStatus } | MembershipStatus;
        const statusData = (response as { data?: MembershipStatus })?.data || (response as MembershipStatus);
        setStatus(statusData);
      } catch (err) {
        console.error('Error fetching membership status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handlePurchase = async (membershipType: string) => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    try {
      setPurchasing(membershipType);
      setError(null);
      setSuccess(null);

      await apiClient.purchaseMembership(membershipType);
      
      setSuccess(`Successfully purchased ${membershipType} membership! Your design quota has been updated.`);
      
      // 刷新会员状态
      const newStatus = await apiClient.getMembershipStatus() as unknown as { data?: MembershipStatus } | MembershipStatus;
      const statusData = (newStatus as { data?: MembershipStatus })?.data || (newStatus as MembershipStatus);
      setStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase membership');
      console.error('Error purchasing membership:', err);
    } finally {
      setPurchasing(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to view membership options</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading membership status...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 当前状态 */}
      {status?.has_membership && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Active Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800">
              You have an active {status.membership_type} membership
            </p>
            <p className="text-sm text-green-700 mt-2">
              Designs used: {status.designs_used} / {status.designs_quota}
            </p>
            {status.expires_at && (
              <p className="text-sm text-green-700">
                Expires at: {new Date(status.expires_at).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 错误和成功消息 */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* 会员套餐 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MEMBERSHIP_TIERS.map((tier) => (
          <Card
            key={tier.type}
            className={`relative transition transform hover:shadow-lg ${
              tier.recommended ? 'ring-2 ring-blue-500 md:scale-105' : ''
            }`}
          >
            {tier.recommended && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl text-sm font-semibold">
                Recommended
              </div>
            )}

            <CardHeader>
              <CardTitle className={tier.recommended ? 'text-blue-600' : ''}>
                {tier.name}
              </CardTitle>
              <CardDescription>{tier.duration}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 价格 */}
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Monthly cost</p>
                <p className="text-3xl font-bold">¥{(tier.price / parseInt(tier.duration.split(' ')[0])).toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {tier.price} total for {tier.duration}
                </p>
              </div>

              {/* 设计配额 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-lg">{tier.designs}</p>
                <p className="text-sm text-gray-600">design uploads</p>
              </div>

              {/* 功能列表 */}
              <ul className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* 购买按钮 */}
              <Button
                onClick={() => handlePurchase(tier.type)}
                disabled={
                  purchasing === tier.type ||
                  (status?.has_membership && status.membership_type === tier.type)
                }
                className="w-full"
                variant={tier.recommended ? 'default' : 'outline'}
              >
                {purchasing === tier.type
                  ? 'Processing...'
                  : status?.has_membership && status.membership_type === tier.type
                  ? 'Current Plan'
                  : `Purchase - ¥${tier.price}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 常见问题 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-sm">Can I upgrade my plan?</p>
            <p className="text-sm text-gray-600">Yes, you can upgrade anytime. The unused portion will be credited.</p>
          </div>
          <div>
            <p className="font-semibold text-sm">What happens after my membership expires?</p>
            <p className="text-sm text-gray-600">Your existing designs remain published, but you cannot upload new ones.</p>
          </div>
          <div>
            <p className="font-semibold text-sm">Is there a commission discount?</p>
            <p className="text-sm text-gray-600">Yes! Half-year members get 5% off, annual members get 10% off their design commissions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
