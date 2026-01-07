'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CreditCard, ShoppingCart, Check, Zap, ArrowLeft, Sun, Moon, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
          if (data.error) router.push('/login');
          else setUser(data);
      });
  }, []);

  const packs = [
    { price: 1, coins: 300, popular: false },
    { price: 5, coins: 1750, popular: true },
    { price: 10, coins: 3500, popular: false },
  ];

  const handleBuy = async (pack: any) => {
    try {
        const res = await fetch('/api/billing/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                packId: pack.coins, // Using coins as ID for simplicity
                price: pack.price,
                coins: pack.coins
            })
        });
        
        const data = await res.json();
        
        if (res.ok && data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || 'Erreur lors de l\'initialisation du paiement');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              SenStudio<span className="text-indigo-600 dark:text-indigo-400">Host</span>
            </Link>
             <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-500">
              <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Vue d'ensemble</Link>
              <Link href="/dashboard/billing" className="text-neutral-900 dark:text-neutral-100">Facturation</Link>
            </div>
          </div>
          
           <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-sm font-mono font-bold">{user?.coins} Coins</span>
            </div>
             <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Recharger vos Coins</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">Choisissez le pack qui correspond à vos besoins. Les coins sont débités automatiquement chaque 24h pour vos bots actifs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packs.map((pack, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative p-8 rounded-3xl bg-white dark:bg-neutral-900 border ${pack.popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-neutral-200 dark:border-neutral-800'} flex flex-col`}
                >
                    {pack.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide rounded-full">
                            Populaire
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <span className="text-5xl font-bold tracking-tight">${pack.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-8">
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xl font-bold">{pack.coins} Coins</span>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Check className="w-5 h-5 text-green-500" />
                            Accès instantané
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Check className="w-5 h-5 text-green-500" />
                            Support prioritaire
                        </li>
                         <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Check className="w-5 h-5 text-green-500" />
                            Valable à vie
                        </li>
                    </ul>
                    
                    <button 
                        onClick={() => handleBuy(pack)}
                        className={`w-full py-4 rounded-xl font-bold transition-all ${
                            pack.popular 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30' 
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                        }`}
                    >
                        Acheter maintenant
                    </button>
                </motion.div>
            ))}
        </div>
      </main>
    </div>
  );
}
