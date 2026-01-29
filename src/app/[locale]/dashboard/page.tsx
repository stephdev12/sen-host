'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  CreditCard, 
  LogOut, 
  Moon, 
  Plus, 
  RefreshCw, 
  Server, 
  Settings, 
  Sun,
  Trash2,
  Power,
  Copy,
  Terminal,
  X,
  Menu,
  Edit,
  Loader2,
  Download,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Mail,
  FileCode,
  ArrowRight,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import EarnCoinsCard from '@/components/ads/EarnCoinsCard';
import NativeBannerAd from '@/components/ads/NativeBannerAd';

interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  referralCode?: string;
  emailVerified?: string | null;
  bots: BotInstance[];
  dailyAdCount: number;
  lastAdWatchAt: string | null;
}

interface BotInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'pairing';
  phoneNumber?: string;
  pairingCode?: string;
  template: string;
  type?: string;
}

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  // Verification State
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Create Bot Form
  const [createStep, setCreateStep] = useState<'selection' | 'config'>('selection');
  const [newBotName, setNewBotName] = useState('');
  const [newBotPhone, setNewBotPhone] = useState('');
  // const [newBotSessionId, setNewBotSessionId] = useState(''); // Removed, using dynamic fields now
  const [templates, setTemplates] = useState<{id: string, name: string, description?: string, sessionIdUrl?: string, config?: Record<string, any>}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('sen-bot');
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  const [creating, setCreating] = useState(false);
  const [processingAction, setProcessingAction] = useState<{id: string, action: string} | null>(null);

  // Initialize Dynamic Fields when template changes
  useEffect(() => {
    const tmpl = templates.find(t => t.id === selectedTemplate);
    if (tmpl && tmpl.config) {
        const fields = { ...tmpl.config };
        
        // Ensure critical fields have defaults if missing in config but required for typical bots
        // Logic: We trust the config scanner.
        // But for "Standard Form" experience, we might want to pre-fill phone number if user typed it before switching templates?
        // Actually, let's just reset to template defaults.
        
        // Sync Phone Number if exists in config
        const phoneKey = Object.keys(fields).find(k => ['OWNER_NUMBER', 'PHONE_NUMBER', 'NUMBER', 'OWNER_NUMBERS'].includes(k));
        if (phoneKey && fields[phoneKey]) {
            setNewBotPhone(String(fields[phoneKey]));
        } else {
             setNewBotPhone(''); // Reset if not in config? Or keep previous input? 
             // Better to keep user input if they typed it.
        }

        setDynamicFields(fields);
    } else {
        // Fallback for templates without config (Legacy/Hardcoded in API)
        setDynamicFields({});
    }
  }, [selectedTemplate, templates]);

  const handleDynamicChange = (key: string, value: any) => {
      setDynamicFields(prev => ({ ...prev, [key]: value }));
      
      // Sync special fields to top-level state
      if (['OWNER_NUMBER', 'PHONE_NUMBER', 'NUMBER', 'OWNER_NUMBERS'].includes(key)) {
          setNewBotPhone(value);
      }
  };


  // Transfer Form
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(20);
  const [transferring, setTransferring] = useState(false);

  // Edit Bot Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotInstance | null>(null);
  const [editBotName, setEditBotName] = useState('');
  const [editBotPhone, setEditBotPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  // Pairing Modal
  const [pairingBot, setPairingBot] = useState<BotInstance | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchUser();
    fetchTemplates();
    const interval = setInterval(fetchUser, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTemplates = async () => {
      try {
          const res = await fetch('/api/bots/templates');
          const data = await res.json();
          if (data.templates) setTemplates(data.templates);
      } catch (e) {
          console.error('Error fetching templates:', e);
      }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!pairingCode) return;
    try {
        await navigator.clipboard.writeText(pairingCode);
        alert(t('modals.pairing.copied'));
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = pairingCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            alert(t('modals.pairing.copied'));
        } catch (e) {
            alert('Erreur');
        }
        document.body.removeChild(textArea);
    }
  };

  const handleLogout = async () => {
      router.push('/login');
  };

  const handleCreateBot = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
          // Sync phone back to dynamic fields if needed (in case user edited top-level phone input)
          // Actually, we'll just pass top-level phone to API, and let API/dynamic fields handle the env var.
          // But wait, the API uses envVars if provided. 
          // So we should update the specific key in envVars with newBotPhone value before sending.
          
          const payloadVars = { ...dynamicFields };
          // Find phone key
          const phoneKey = Object.keys(payloadVars).find(k => ['OWNER_NUMBER', 'PHONE_NUMBER', 'NUMBER', 'OWNER_NUMBERS'].includes(k));
          if (phoneKey) {
              payloadVars[phoneKey] = newBotPhone;
          }

          const res = await fetch('/api/bots/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  name: newBotName, 
                  phoneNumber: newBotPhone,
                  template: selectedTemplate,
                  envVars: payloadVars
              })
          });
          const data = await res.json();
          if (res.ok) {
              setIsCreateModalOpen(false);
              fetchUser();
              setNewBotName('');
              setNewBotPhone('');
              setDynamicFields({});
              setCreateStep('selection'); // Reset step
          } else {
              alert(data.error);
          }
      } catch (e) {
          alert('Erreur lors de la création');
      } finally {
          setCreating(false);
      }
  };

  const handleUpdateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    setUpdating(true);
    try {
        const res = await fetch(`/api/bots/${editingBot.id}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: editBotName, 
                phoneNumber: editBotPhone
            })
        });
        const data = await res.json();
        if (res.ok) {
            setIsEditModalOpen(false);
            fetchUser();
        } else {
            alert(data.error);
        }
    } catch (e) {
        alert('Erreur lors de la mise à jour');
    } finally {
        setUpdating(false);
    }
  };

  const handleUpgradeBot = async (botId: string) => {
    if (!confirm(t('bot_list.upgrade_confirm'))) return;
    
    setProcessingAction({ id: botId, action: 'upgrade' });
    try {
        const res = await fetch(`/api/bots/${botId}/upgrade`, {
            method: 'POST'
        });
        const data = await res.json();
        
        if (res.ok) {
            alert('Mise à jour et redémarrage effectués avec succès !');
            fetchUser();
        } else {
            alert(data.error || 'Erreur lors de la mise à jour');
        }
    } catch (e) {
        alert('Erreur technique');
    } finally {
        setProcessingAction(null);
    }
  };


  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'delete' | 'restart') => {
      try {
          if (action === 'delete' && !confirm(t('bot_list.delete_confirm'))) return;

          setProcessingAction({ id: botId, action });
          const res = await fetch(`/api/bots/${botId}/action`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action })
          });
          
          if (res.ok) {
              if (action === 'start') {
                  const bot = user?.bots.find(b => b.id === botId);
                  if (bot) {
                      setPairingBot(bot);
                      pollLogs(botId);
                  }
              }
              fetchUser();
          } else {
              const data = await res.json();
              alert(data.error);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setProcessingAction(null);
      }
  };

  const pollLogs = async (botId: string) => {
      let attempts = 0;
      const maxAttempts = 20; 
      
      const check = async () => {
          if (attempts >= maxAttempts) return;
          try {
              const res = await fetch(`/api/bots/${botId}/logs`);
              const contentType = res.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                  return;
              }

              const data = await res.json();
              setLogs(data.logs);
              if (data.pairingCode) {
                  setPairingCode(data.pairingCode);
                  return; 
              }
              attempts++;
              setTimeout(check, 3000);
          } catch (e) {
              console.error("Erreur polling logs:", e);
          }
      };
      check();
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferring(true);
    try {
        const res = await fetch('/api/coins/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                targetEmail: transferEmail, 
                amount: transferAmount 
            })
        });
        const data = await res.json();
        if (res.ok) {
            alert(t('modals.transfer.success'));
            setIsTransferModalOpen(false);
            fetchUser();
            setTransferEmail('');
            setTransferAmount(20);
        } else {
            alert(data.error);
        }
    } catch (e) {
        alert('Erreur technique');
    } finally {
        setTransferring(false);
    }
  };

  const handleCopyReferral = async () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    try {
        await navigator.clipboard.writeText(link);
        alert(t('referral.copied'));
    } catch (err) {
        alert('Erreur lors de la copie');
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
        const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
        if (res.ok) setResendStatus('sent');
        else setResendStatus('error');
    } catch (e) {
        setResendStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Blocking Overlay for Unverified Users
  if (user && !user.emailVerified) {
      return (
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl text-center border border-neutral-200 dark:border-neutral-800">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{t('verification.title')}</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                      {t('verification.desc', { email: user.email })}
                  </p>
                  
                  {resendStatus === 'sent' ? (
                      <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl mb-6">
                          {t('verification.sent')}
                      </div>
                  ) : (
                      <button 
                        onClick={handleResendVerification}
                        disabled={resendStatus === 'sending'}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                      >
                          {resendStatus === 'sending' ? t('verification.sending') : t('verification.resend')}
                      </button>
                  )}
                  
                  <button onClick={handleLogout} className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 hover:underline">
                      {t('verification.logout')}
                  </button>
              </div>
          </div>
      );
  }

  const isPremium = user && (user as any).isPremium && new Date((user as any).premiumExpiresAt) > new Date();
  const reachedLimit = !isPremium && (user?.bots?.length || 0) >= 2;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
              <img src="https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              SenStudio<span className="text-indigo-600 dark:text-indigo-400">Host</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-500">
              <Link href="/dashboard" className="text-neutral-900 dark:text-neutral-100">{t('nav.overview')}</Link>
              <Link href="/dashboard/billing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{t('nav.billing')}</Link>
              <Link href="/dashboard/community" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{t('nav.community')}</Link>
              <Link href="/dashboard/help" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{t('nav.help')}</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-sm font-mono font-bold">{user?.coins} Coins</span>
              <Link href="/dashboard/billing" className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                 <Plus className="w-3 h-3" />
              </Link>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors hidden md:block"
              title={t('nav.theme')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors hidden md:block" title={t('nav.logout')}>
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 md:hidden text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                    <div className="px-6 py-4 space-y-4">
                        <Link href="/dashboard" className="block py-2 text-sm font-medium">{t('nav.overview')}</Link>
                        <Link href="/dashboard/billing" className="block py-2 text-sm font-medium">{t('nav.billing')}</Link>
                        <Link href="/dashboard/community" className="block py-2 text-sm font-medium">{t('nav.community')}</Link>
                        <Link href="/dashboard/help" className="block py-2 text-sm font-medium">{t('nav.help')}</Link>
                        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                {user?.coins} Coins
                            </span>
                            <Link href="/dashboard/billing" className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-bold">{t('nav.recharge')}</Link>
                        </div>
                         <div className="flex items-center justify-between mt-4">
                             <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {t('nav.theme')}
                            </button>
                             <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-500">
                                <LogOut className="w-4 h-4" />
                                {t('nav.logout')}
                            </button>
                         </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{t('header.greeting', { name: user?.username || '' })}</h1>
            <p className="text-neutral-500 dark:text-neutral-400">{t('header.subtitle')}</p>
          </div>
          <button
             onClick={() => !reachedLimit && setIsCreateModalOpen(true)}
             disabled={reachedLimit}
             className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${reachedLimit ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}
          >
            <Plus className="w-5 h-5" />
            {t('header.new_bot')}
          </button>
        </header>

        {reachedLimit && (
            <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3 text-indigo-600 dark:text-indigo-400 text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>{t('bot_limit_reached')}</span>
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {user && <EarnCoinsCard user={user} onUpdate={fetchUser} />}

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('stats.active_bots')}</p>
                <p className="text-2xl font-bold">{user?.bots?.filter(b => b.status === 'running').length || 0}</p>
              </div>
            </div>
          </div>
          
           <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('stats.remaining_coins')}</p>
                <p className="text-2xl font-bold">{user?.coins}</p>
              </div>
            </div>
          </div>

           <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('stats.uptime')}</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral & Transfer Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Referral Card */}
            <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        {t('referral.title')}
                    </h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-xs">{t('referral.desc')}</p>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                        <input 
                            readOnly 
                            value={`${origin}/register?ref=${user?.referralCode || ''}`}
                            className="bg-transparent border-none text-xs flex-1 px-2 outline-none text-white placeholder-white/50"
                        />
                        <button 
                            onClick={handleCopyReferral}
                            className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                        >
                            {t('referral.copy')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Transfer Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-500" />
                        {t('transfer.title')}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">{t('transfer.desc')}</p>
                </div>
                <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="w-full py-3 rounded-xl font-bold border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-400 dark:hover:text-neutral-950 transition-all"
                >
                    {t('transfer.send')}
                </button>
            </div>
        </div>

        <NativeBannerAd />

        {/* Bot List */}
        <h2 className="text-xl font-bold mb-6">{t('bot_list.title')}</h2>
        
        {user?.bots && user.bots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.bots.map((bot) => (
              <div key={bot.id} className="group p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-lg">
                                 <div className="flex items-start justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bot.status === 'running' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {processingAction?.id === bot.id && (processingAction.action === 'start' || processingAction.action === 'stop' || processingAction.action === 'restart') ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Power className="w-5 h-5" />
                                        )}
                                     </div>
                                     <div>
                                       <div className="flex items-center gap-2">
                                            <Link href={`/dashboard/bots/${bot.id}/configure`} className="font-bold hover:text-indigo-500 transition-colors flex items-center gap-1">
                                                {bot.name}
                                                <Settings className="w-3 h-3 text-neutral-400" />
                                            </Link>
                                            <button 
                                                onClick={() => {
                                                    setEditingBot(bot);
                                                    setEditBotName(bot.name);
                                                    setEditBotPhone(bot.phoneNumber || '');
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-1 text-neutral-400 hover:text-indigo-500 transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                       </div>
                                       <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">{bot.template}</p>
                                       <p className="text-xs text-neutral-500 font-mono">{bot.phoneNumber}</p>
                                     </div>
                                   </div>
                                   <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${bot.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                     {bot.status}
                                   </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                   {bot.status === 'stopped' ? (
                                        <>
                                            <button 
                                                onClick={() => router.push(`/dashboard/bots/${bot.id}/configure`)}
                                                className="flex-1 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Config
                                            </button>
                                            <button 
                                                onClick={() => handleBotAction(bot.id, 'start')}
                                                disabled={processingAction?.id === bot.id}
                                                className="flex-1 py-2 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processingAction?.id === bot.id && processingAction.action === 'start' && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {t('bot_list.start')}
                                            </button>
                                        </>
                                   ) : (
                                       <button 
                                            onClick={() => handleBotAction(bot.id, 'stop')}
                                            disabled={processingAction?.id === bot.id}
                                            className="flex-1 py-2 text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {processingAction?.id === bot.id && processingAction.action === 'stop' && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {t('bot_list.stop')}
                                        </button>
                                   )}
                                   
                                   <button 
                                       onClick={() => handleUpgradeBot(bot.id)}
                                       disabled={processingAction?.id === bot.id}
                                       className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                       title={t('bot_list.upgrade')}
                                   >
                                     {processingAction?.id === bot.id && processingAction.action === 'upgrade' ? (
                                         <Loader2 className="w-4 h-4 animate-spin" />
                                     ) : (
                                         <Download className="w-4 h-4" />
                                     )}
                                   </button>

                                   <button 
                                       onClick={() => handleBotAction(bot.id, 'restart')}
                                       disabled={processingAction?.id === bot.id}
                                       className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                                       title={t('bot_list.restart')}
                                   >
                                     <RefreshCw className={`w-4 h-4 ${processingAction?.id === bot.id && processingAction.action === 'restart' ? 'animate-spin' : ''}`} />
                                   </button>
                                    <button 
                                        onClick={() => handleBotAction(bot.id, 'delete')}
                                        disabled={processingAction?.id === bot.id}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                        title={t('bot_list.delete')}
                                    >
                                     {processingAction?.id === bot.id && processingAction.action === 'delete' ? (
                                         <Loader2 className="w-4 h-4 animate-spin" />
                                     ) : (
                                         <Trash2 className="w-4 h-4" />
                                     )}
                                   </button>
                                </div>                {bot.status === 'running' && (
                    <button 
                        onClick={() => { setPairingBot(bot); pollLogs(bot.id); }}
                        className="w-full mt-2 text-xs text-indigo-500 hover:underline text-center"
                    >
                        {t('bot_list.logs_link')}
                    </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
            <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">{t('bot_list.empty_title')}</h3>
            <p className="text-neutral-500 mb-6">{t('bot_list.empty_desc')}</p>
            <button 
              onClick={() => !reachedLimit && setIsCreateModalOpen(true)}
              disabled={reachedLimit}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${reachedLimit ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {t('bot_list.create_btn')}
            </button>
          </div>
        )}

        {/* Create Bot Modal */}
        <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto custom-scrollbar"
             >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {createStep === 'config' && (
                            <button 
                                onClick={() => setCreateStep('selection')} 
                                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-2xl font-bold">
                            {createStep === 'selection' ? t('modals.create.title') : 'Configurer le Bot'}
                        </h2>
                    </div>
                    <button onClick={() => { setIsCreateModalOpen(false); setCreateStep('selection'); }} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-neutral-500 mb-6 text-sm">
                    {createStep === 'selection' 
                        ? 'Choisissez le type de bot que vous souhaitez déployer.' 
                        : 'Personnalisez les paramètres de votre nouveau bot.'}
                </p>
                
                {createStep === 'selection' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(t_obj => (
                            <button
                                key={t_obj.id}
                                onClick={() => {
                                    setSelectedTemplate(t_obj.id);
                                    setCreateStep('config');
                                }}
                                className="p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group border-neutral-100 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-lg">{t_obj.name}</span>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {t_obj.description || 'Le bot WhatsApp le plus puissant et complet.'}
                                </p>
                            </button>
                        ))}
                        
                        <Link
                            href="/dashboard/bots/new/custom"
                            className="p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-left transition-all group flex flex-col justify-center gap-2 relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <FileCode className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg text-indigo-700 dark:text-indigo-300">Custom Bot</span>
                            </div>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                                Importer depuis Git ou ZIP
                            </p>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleCreateBot} className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <Zap className="w-5 h-5 text-indigo-500" />
                            <div>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Template sélectionné</p>
                                <p className="font-bold">{templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('modals.create.name_label')}</label>
                                    <input 
                                        type="text" 
                                        value={newBotName}
                                        onChange={(e) => setNewBotName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                        placeholder={t('modals.create.name_placeholder')}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('modals.create.phone_label')}</label>
                                    <input 
                                        type="text" 
                                        value={newBotPhone}
                                        onChange={(e) => {
                                            setNewBotPhone(e.target.value);
                                            const phoneKey = Object.keys(dynamicFields).find(k => ['OWNER_NUMBER', 'PHONE_NUMBER', 'NUMBER', 'OWNER_NUMBERS'].includes(k));
                                            if (phoneKey) handleDynamicChange(phoneKey, e.target.value);
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                        placeholder={t('modals.create.phone_placeholder')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <div className="bg-neutral-50 dark:bg-neutral-950 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <h3 className="text-xs font-bold mb-3 text-neutral-400 uppercase tracking-wider sticky top-0 bg-neutral-50 dark:bg-neutral-950 py-1 z-10">
                                    Configuration Avancée
                                </h3>
                                
                                {Object.keys(dynamicFields).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(dynamicFields).map(([key, value]) => {
                                            if (['OWNER_NUMBER', 'PHONE_NUMBER', 'NUMBER', 'OWNER_NUMBERS', 'PORT', 'CI'].includes(key)) return null;

                                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                            const isBool = value === 'true' || value === 'false' || value === true || value === false;
                                            const isSessionId = key === 'SESSION_ID' || key === 'SESSION';
                                            const currentTemplate = templates.find(t => t.id === selectedTemplate);

                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</label>
                                                        {isSessionId && currentTemplate?.sessionIdUrl && (
                                                            <a 
                                                                href={currentTemplate.sessionIdUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1"
                                                            >
                                                                Où trouver le Session ID ?
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    {isBool ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDynamicChange(key, String(value) === 'true' ? 'false' : 'true')}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${String(value) === 'true' ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${String(value) === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    ) : (
                                                        <input 
                                                            type="text" 
                                                            value={String(value)}
                                                            onChange={(e) => handleDynamicChange(key, e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-neutral-400 text-sm">
                                        {(selectedTemplate === 'ANITA-V5' || selectedTemplate === 'keith-md') ? (
                                             <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-medium text-left">Session ID</label>
                                                    {templates.find(t => t.id === selectedTemplate)?.sessionIdUrl && (
                                                        <a 
                                                            href={templates.find(t => t.id === selectedTemplate)?.sessionIdUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                                                        >
                                                            Où le trouver ?
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    onChange={(e) => handleDynamicChange(selectedTemplate === 'keith-md' ? 'SESSION' : 'SESSION_ID', e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                                                    placeholder="Entrez votre Session ID"
                                                />
                                            </div>
                                        ) : (
                                            <p>Aucune configuration supplémentaire requise.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                      
                        <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <button 
                                type="button" 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                {t('modals.create.cancel')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={creating}
                                className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                            >
                                {creating && <Loader2 className="w-5 h-5 animate-spin" />}
                                {creating ? t('modals.create.creating') : t('modals.create.create')}
                            </button>
                        </div>
                    </form>
                )}
             </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* Edit Bot Modal */}
        <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800"
             >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('modals.edit.title')}</h2>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-neutral-500 mb-6 text-sm">{t('modals.edit.desc')}</p>
                
                <form onSubmit={handleUpdateBot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('modals.create.name_label')}</label>
                    <input 
                        type="text" 
                        value={editBotName}
                        onChange={(e) => setEditBotName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder={t('modals.create.name_placeholder')}
                        required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">{t('modals.create.phone_label')}</label>
                    <input 
                        type="text" 
                        value={editBotPhone}
                        onChange={(e) => setEditBotPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder={t('modals.create.phone_placeholder')}
                        required
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {t('modals.create.cancel')}
                    </button>
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      {updating ? t('modals.edit.saving') : t('modals.edit.save')}
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* Pairing/Logs Modal */}
        <AnimatePresence>
        {pairingBot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-indigo-500" />
                            {t('modals.pairing.title')}
                        </h2>
                         <button onClick={() => { setPairingBot(null); setPairingCode(null); setLogs(''); }} className="text-neutral-400 hover:text-neutral-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {pairingCode ? (
                        <div className="mb-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center border border-indigo-100 dark:border-indigo-800">
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase tracking-wide">{t('modals.pairing.code_label')}</p>
                            <div className="text-4xl font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-300 mb-4 select-all">
                                {pairingCode}
                            </div>
                            <p className="text-xs text-neutral-500 mb-4">
                                {t('modals.pairing.code_desc')}
                            </p>
                            <button 
                                onClick={handleCopyCode}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                            >
                                <Copy className="w-4 h-4" />
                                {t('modals.pairing.copy')}
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-sm font-medium">{t('modals.pairing.waiting')}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-neutral-950 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 custom-scrollbar">
                        <pre className="whitespace-pre-wrap break-words">{logs || `> ${t('modals.pairing.initializing')}`}</pre>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        {/* Transfer Modal */}
        <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800"
             >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('transfer.title')}</h2>
                    <button onClick={() => setIsTransferModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-neutral-500 mb-6 text-sm">{t('transfer.desc')}</p>
                
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('transfer.email_label')}</label>
                    <input 
                        type="email" 
                        value={transferEmail}
                        onChange={(e) => setTransferEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="destinataire@email.com"
                        required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">{t('transfer.amount_label')}</label>
                    <input 
                        type="number" 
                        min="20"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        required
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsTransferModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {t('modals.create.cancel')}
                    </button>
                    <button 
                      type="submit" 
                      disabled={transferring}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {transferring && <Loader2 className="w-4 h-4 animate-spin" />}
                      {transferring ? t('transfer.sending') : t('transfer.send')}
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
}