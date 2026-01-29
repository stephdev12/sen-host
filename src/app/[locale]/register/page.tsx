'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';

import { useTranslations } from 'next-intl';

function RegisterForm() {
  const t = useTranslations('RegisterPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, referralCode: ref }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('error_default'));
      }

      // Auto login logic could go here, but for now redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">{t('subtitle')}</p>
          {ref && (
            <div className="mt-2 text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 py-1 px-3 rounded-full inline-block">
              Referral Code: {ref}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">{t('username_label')}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder={t('username_placeholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">{t('email_label')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder={t('email_placeholder')}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">{t('password_label')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder={t('password_placeholder')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t('register_button')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          {t('have_account')}{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            {t('login_link')}
          </Link>
        </div>
      </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="animate-spin w-10 h-10 text-indigo-600" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
