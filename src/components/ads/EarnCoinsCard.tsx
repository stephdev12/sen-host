'use client';

import { useState } from 'react';
import { Play, Loader2, Check, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
    user: {
        coins: number;
        dailyAdCount: number;
        lastAdWatchAt: string | null;
    };
    onUpdate: () => void; // Trigger refetch in parent
}

export default function EarnCoinsCard({ user, onUpdate }: Props) {
    const t = useTranslations('Ads');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [status, setStatus] = useState<'idle' | 'watching' | 'claiming' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const AD_URL = "https://www.effectivegatecpm.com/eex9cunhz?key=707457b67ae045405672b7a09c51850d";

    const startAd = () => {
        if (user.dailyAdCount >= 10) return;
        
        // Open Ad
        window.open(AD_URL, '_blank');
        
        // Start Timer
        setStatus('watching');
        setTimer(15);
        
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setStatus('claiming'); // Ready to claim
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const claimReward = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ads/reward', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                onUpdate(); // Refresh user data
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setErrorMsg(data.error);
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (e) {
            setStatus('error');
            setErrorMsg(t('error'));
        } finally {
            setLoading(false);
        }
    };

    // Calculate progress
    const progress = (user.dailyAdCount / 10) * 100;

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Play className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                        {t('title')}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{user.dailyAdCount}/10</span>
                    <span className="text-xs text-neutral-400 block uppercase font-bold tracking-wider">{t('today')}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {status === 'idle' && (
                <button
                    onClick={startAd}
                    disabled={user.dailyAdCount >= 10}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        user.dailyAdCount >= 10 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                >
                    {user.dailyAdCount >= 10 ? t('btn_limit') : t('btn_start')}
                </button>
            )}

            {status === 'watching' && (
                <button disabled className="w-full py-3 rounded-xl font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-wait flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('btn_wait', { timer })}
                </button>
            )}

            {status === 'claiming' && (
                <button 
                    onClick={claimReward}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 animate-pulse"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {t('btn_claim')}
                </button>
            )}

            {status === 'success' && (
                <div className="w-full py-3 rounded-xl font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    {t('success')}
                </div>
            )}

            {status === 'error' && (
                <div className="w-full py-3 rounded-xl font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg || t('error')}
                </div>
            )}
            
            <p className="text-xs text-center text-neutral-400 mt-4">
                {t('interval')}
            </p>
        </div>
    );
}