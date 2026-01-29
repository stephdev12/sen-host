'use client';

import { MessageCircle, Send, ArrowLeft, Bot, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const t = useTranslations('help');
  const d = useTranslations('Dashboard');
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

  const links = [
    {
      title: t('whatsapp_title'),
      description: t('whatsapp_desc'),
      url: "https://whatsapp.com/channel/0029VbAK3nYEquiZ3Ajpd90f",
      icon: MessageCircle,
      color: "bg-green-500",
      textColor: "text-green-500"
    },
    {
      title: t('telegram_title'),
      description: t('telegram_desc'),
      url: "https://t.me/senstudiocm",
      icon: Send,
      color: "bg-blue-500",
      textColor: "text-blue-500"
    }
  ];

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
              <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.overview')}</Link>
              <Link href="/dashboard/billing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.billing')}</Link>
              <Link href="/dashboard/community" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.community')}</Link>
              <Link href="/dashboard/help" className="text-neutral-900 dark:text-neutral-100">{d('nav.help')}</Link>
            </div>
          </div>
          
           <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                <span className="text-sm font-mono font-bold">{user?.coins || 0} Coins</span>
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

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {links.map((link, i) => (
            <a 
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl ${link.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <link.icon className={`w-6 h-6 ${link.textColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {link.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          <h3 className="text-lg font-bold mb-2 text-indigo-900 dark:text-indigo-100">{t('note_title')}</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            {t('note_desc')}
          </p>
        </div>
      </main>
    </div>
  );
}
