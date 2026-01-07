'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre transaction...');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    
    if (statusParam === 'success') {
      setStatus('success');
      setMessage('Votre paiement a été validé avec succès ! Vos coins ont été ajoutés à votre compte.');
    } else if (statusParam === 'cancel') {
      setStatus('cancel');
      setMessage('Le paiement a été annulé.');
    } else {
      setStatus('error');
      setMessage('Une erreur est survenue lors du traitement de votre paiement.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold mb-2">Traitement...</h1>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">Paiement Réussi !</h1>
          </div>
        )}

        {status === 'cancel' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-yellow-600">Paiement Annulé</h1>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-red-600">Erreur</h1>
          </div>
        )}

        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          {message}
        </p>

        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30"
        >
          Retour au Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
