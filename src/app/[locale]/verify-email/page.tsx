'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (e) {
        setStatus('error');
        setMessage('Erreur de connexion');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl text-center border border-neutral-200 dark:border-neutral-800">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold">Vérification en cours...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Compte Vérifié !</h2>
            <p className="text-neutral-500 mb-6">{message}</p>
            <p className="text-sm text-neutral-400">Redirection vers la connexion...</p>
            <Link href="/login" className="mt-4 text-indigo-600 font-bold hover:underline">
                Se connecter maintenant
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Échec de la vérification</h2>
            <p className="text-red-500 mb-6">{message}</p>
            <Link href="/" className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-bold">
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
