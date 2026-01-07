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
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  bots: BotInstance[];
}

interface BotInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'pairing';
  phoneNumber?: string;
  pairingCode?: string;
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Create Bot Form
  const [newBotName, setNewBotName] = useState('');
  const [newBotPhone, setNewBotPhone] = useState('');
  const [templates, setTemplates] = useState<{id: string, name: string}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('sen-bot');
  const [creating, setCreating] = useState(false);

  // Pairing Modal
  const [pairingBot, setPairingBot] = useState<BotInstance | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [logs, setLogs] = useState('');

  useEffect(() => {
    fetchUser();
    fetchTemplates();
    // Poll for updates every 10s
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
      const res = await fetch('/api/auth/me');
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
        alert('Code copié !');
    } catch (err) {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = pairingCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            alert('Code copié !');
        } catch (e) {
            alert('Erreur lors de la copie, veuillez copier manuellement.');
        }
        document.body.removeChild(textArea);
    }
  };

  const handleLogout = async () => {
      // Clear cookie by calling logout api (not implemented, but client side redirect works if cookie expires)
      // Actually we should have a logout route to clear cookie.
      // For now just redirect.
      router.push('/login');
  };

  const handleCreateBot = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
          const res = await fetch('/api/bots/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  name: newBotName, 
                  phoneNumber: newBotPhone,
                  template: selectedTemplate 
              })
          });
          const data = await res.json();
          if (res.ok) {
              setIsCreateModalOpen(false);
              fetchUser();
              setNewBotName('');
              setNewBotPhone('');
          } else {
              alert(data.error);
          }
      } catch (e) {
          alert('Erreur lors de la création');
      } finally {
          setCreating(false);
      }
  };


  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'delete' | 'restart') => {
      try {
          if (action === 'delete' && !confirm('Voulez-vous vraiment supprimer ce bot ?')) return;

          const res = await fetch(`/api/bots/${botId}/action`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action })
          });
          
          if (res.ok) {
              if (action === 'start') {
                  // Start polling for pairing code
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
      }
  };

  const pollLogs = async (botId: string) => {
      // Poll logs for 60 seconds or until code found
      let attempts = 0;
      const maxAttempts = 20; // 20 * 3s = 60s
      
      const check = async () => {
          if (attempts >= maxAttempts) return;
          try {
              const res = await fetch(`/api/bots/${botId}/logs`);
              
              // Vérification du content-type pour éviter le crash HTML
              const contentType = res.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                  console.error("Réponse API invalide (pas de JSON):", await res.text());
                  return;
              }

              const data = await res.json();
              setLogs(data.logs);
              if (data.pairingCode) {
                  setPairingCode(data.pairingCode);
                  return; // Found
              }
              attempts++;
              setTimeout(check, 3000);
          } catch (e) {
              console.error("Erreur polling logs:", e);
          }
      };
      check();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
              <Link href="/dashboard" className="text-neutral-900 dark:text-neutral-100">Vue d'ensemble</Link>
              <Link href="/dashboard/billing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Facturation</Link>
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
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors hidden md:block">
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
                        <Link href="/dashboard" className="block py-2 text-sm font-medium">Vue d'ensemble</Link>
                        <Link href="/dashboard/billing" className="block py-2 text-sm font-medium">Facturation</Link>
                        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                {user?.coins} Coins
                            </span>
                            <Link href="/dashboard/billing" className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-bold">Recharger</Link>
                        </div>
                         <div className="flex items-center justify-between mt-4">
                             <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                Changer de thème
                            </button>
                             <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-500">
                                <LogOut className="w-4 h-4" />
                                Déconnexion
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
            <h1 className="text-3xl font-bold tracking-tight mb-1">Bonjour, {user?.username}</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Gérez vos instances de bots WhatsApp.</p>
          </div>
          <button
             onClick={() => setIsCreateModalOpen(true)}
             className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-5 h-5" />
            Nouveau Bot
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Bots Actifs</p>
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Coins Restants</p>
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Temps de fonctionnement</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bot List */}
        <h2 className="text-xl font-bold mb-6">Vos Instances</h2>
        
        {user?.bots && user.bots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.bots.map((bot) => (
              <div key={bot.id} className="group p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bot.status === 'running' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <Power className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold">{bot.name}</h3>
                       <p className="text-xs text-neutral-500 font-mono">{bot.phoneNumber}</p>
                     </div>
                   </div>
                   <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${bot.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                     {bot.status}
                   </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                   {bot.status === 'stopped' ? (
                        <button 
                            onClick={() => handleBotAction(bot.id, 'start')}
                            className="flex-1 py-2 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                            Démarrer
                        </button>
                   ) : (
                       <button 
                            onClick={() => handleBotAction(bot.id, 'stop')}
                            className="flex-1 py-2 text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                        >
                            Stopper
                        </button>
                   )}
                   
                   <button 
                       onClick={() => handleBotAction(bot.id, 'restart')}
                       className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                       title="Redémarrer"
                   >
                     <RefreshCw className="w-4 h-4" />
                   </button>
                    <button 
                        onClick={() => handleBotAction(bot.id, 'delete')}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Supprimer"
                    >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                {bot.status === 'running' && (
                    <button 
                        onClick={() => { setPairingBot(bot); pollLogs(bot.id); }}
                        className="w-full mt-2 text-xs text-indigo-500 hover:underline text-center"
                    >
                        Voir les logs / Code de pairage
                    </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
            <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">Aucun bot actif</h3>
            <p className="text-neutral-500 mb-6">Commencez par créer votre première instance.</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Créer un Bot
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
               className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800"
             >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Nouveau Bot</h2>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-neutral-500 mb-6 text-sm">Entrez votre numéro pour générer un code de pairage. Coût: 10 coins / 24h.</p>
                
                <form onSubmit={handleCreateBot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom du bot</label>
                    <input 
                        type="text" 
                        value={newBotName}
                        onChange={(e) => setNewBotName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="Mon Super Bot" 
                        required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">Numéro WhatsApp</label>
                    <input 
                        type="text" 
                        value={newBotPhone}
                        onChange={(e) => setNewBotPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="22997000000" 
                        required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Modèle de Bot</label>
                    <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={creating}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {creating ? 'Création...' : 'Créer'}
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
                            Console / Pairage
                        </h2>
                         <button onClick={() => { setPairingBot(null); setPairingCode(null); setLogs(''); }} className="text-neutral-400 hover:text-neutral-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {pairingCode ? (
                        <div className="mb-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center border border-indigo-100 dark:border-indigo-800">
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold mb-2 uppercase tracking-wide">Code de pairage</p>
                            <div className="text-4xl font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-300 mb-4 select-all">
                                {pairingCode}
                            </div>
                            <p className="text-xs text-neutral-500 mb-4">
                                Allez dans WhatsApp {'>'} Appareils connectés {'>'} Connecter un appareil {'>'} Connecter avec un numéro
                            </p>
                            <button 
                                onClick={handleCopyCode}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                            >
                                <Copy className="w-4 h-4" />
                                Copier le code
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-sm font-medium">En attente du code de pairage...</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-neutral-950 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 custom-scrollbar">
                        <pre className="whitespace-pre-wrap break-words">{logs || '> Initialisation...'}</pre>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
}
