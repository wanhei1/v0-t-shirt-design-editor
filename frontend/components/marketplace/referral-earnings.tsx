'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface EarningsData {
  total_earnings: number;
  commissions_this_month: number;
  referral_earnings: number;
  pending_earnings: number;
}

interface ReferralCode {
  code: string;
  created_at: string;
}

export function ReferralAndEarnings() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 获取推荐代码和收益
  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      try {
        setLoading(true);
        
        // 获取收益
        const earningsResponse = await apiClient.getEarnings() as unknown as { data?: EarningsData } | EarningsData;
        const earningsData = (earningsResponse as { data?: EarningsData })?.data || (earningsResponse as EarningsData);
        setEarnings(earningsData);
        
        // 获取推荐代码
        const codeResponse = await apiClient.generateReferralCode() as unknown as { data?: ReferralCode; code?: string } | ReferralCode;
        if (codeResponse && typeof codeResponse === 'object') {
          const codeData = (codeResponse as { data?: ReferralCode })?.data || (codeResponse as ReferralCode);
          if (codeData) {
            setReferralCode(codeData);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await apiClient.generateReferralCode() as unknown as { data?: ReferralCode; code?: string } | ReferralCode;
      const codeData = (response as { data?: ReferralCode })?.data || (response as ReferralCode);
      
      if (codeData?.code) {
        setReferralCode(codeData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate referral code');
      console.error('Error generating code:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (referralCode?.code) {
      try {
        await navigator.clipboard.writeText(referralCode.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to view referrals and earnings</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 推荐代码部分 */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>Earn ¥15 for each friend who joins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error}
              </div>
            )}

            {referralCode?.code ? (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-bold text-blue-600 tracking-widest">
                      {referralCode.code}
                    </code>
                    <Button
                      size="sm"
                      onClick={handleCopyCode}
                      className="ml-auto"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this code with friends to earn rewards
                  </p>
                </div>

                <div className="text-sm space-y-2">
                  <p className="font-semibold">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Share your referral code with friends</li>
                    <li>They sign up with your code</li>
                    <li>You earn ¥15 when they purchase membership</li>
                    <li>They also get ¥10 discount on their first purchase</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don&apos;t have a referral code yet</p>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? 'Generating...' : 'Generate Referral Code'}
                </Button>
              </div>
            )}

            {/* 分享链接 */}
            {referralCode?.code && (
              <Card className="bg-gray-50 border-none">
                <CardContent className="pt-4">
                  <p className="text-xs text-gray-600 mb-2">Referral Link</p>
                  <code className="text-xs bg-white p-2 rounded block truncate border">
                    https://bit810.cn/ref/{referralCode.code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://bit810.cn/ref/${referralCode.code}`
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    Copy Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* 收益统计 */}
        <div className="space-y-4">
          {/* 总收益 */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-4xl font-bold text-green-600">
                ¥{earnings?.total_earnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Lifetime earnings from design sales</p>
            </CardContent>
          </Card>

          {/* 本月佣金 */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-blue-600">
                ¥{earnings?.commissions_this_month.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Commission from design sales</p>
            </CardContent>
          </Card>

          {/* 推荐奖励 */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Referral Rewards</p>
              <p className="text-3xl font-bold text-purple-600">
                ¥{earnings?.referral_earnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">From referred members</p>
            </CardContent>
          </Card>

          {/* 待结算 */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Pending Payout</p>
              <p className="text-3xl font-bold text-yellow-600">
                ¥{earnings?.pending_earnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting withdrawal (next month)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 提取收益 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Withdrawal</CardTitle>
          <CardDescription>Withdraw your earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Available for Withdrawal</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{earnings?.pending_earnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <Button
              disabled={!earnings || earnings.pending_earnings <= 0}
              className="px-8"
            >
              Withdraw
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            💡 Minimum withdrawal: ¥50 | Processing time: 3-5 business days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
