'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Database, Coins, Lock, Settings as SettingsIcon, Save, Activity, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
      maxTotalBots: 100,
      minCoinsToCreate: 10,
      maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'stephadmin123@') {
        setIsAuthenticated(true);
        fetchData();
        fetchUsers();
    } else {
        alert('Mot de passe incorrect');
    }
  };

  const fetchData = async () => {
      setLoading(true);
      try {
          // Fetch Stats
          const resStats = await fetch('/api/admin/stats', {
              headers: { 'x-admin-password': 'stephadmin123@' }
          });
          if(resStats.ok) setStats(await resStats.json());

          // Fetch Settings
          const resSettings = await fetch('/api/admin/settings', {
              headers: { 'x-admin-password': 'stephadmin123@' }
          });
          if(resSettings.ok) setSettings(await resSettings.json());

      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const fetchUsers = async (query = '') => {
      setSearching(true);
      try {
          const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, {
              headers: { 'x-admin-password': 'stephadmin123@' }
          });
          if (res.ok) {
              setUsers(await res.json());
          }
      } catch (e) {
          console.error(e);
      } finally {
          setSearching(false);
      }
  };

  useEffect(() => {
      if (isAuthenticated) {
          const delayDebounceFn = setTimeout(() => {
              fetchUsers(searchTerm);
          }, 500);
          return () => clearTimeout(delayDebounceFn);
      }
  }, [searchTerm, isAuthenticated]);

  const handleDeleteUser = async (id: string, email: string) => {
      if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${email} ? Tous ses bots seront supprimés.`)) return;
      
      try {
          const res = await fetch('/api/admin/users', {
              method: 'DELETE',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-admin-password': 'stephadmin123@'
              },
              body: JSON.stringify({ id })
          });
          if (res.ok) {
              alert('Utilisateur supprimé');
              fetchUsers(searchTerm);
              fetchData();
          } else {
              alert('Erreur lors de la suppression');
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          const res = await fetch('/api/admin/settings', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-admin-password': 'stephadmin123@'
              },
              body: JSON.stringify(settings)
          });
          if (res.ok) {
              alert('Configuration sauvegardée !');
          } else {
              alert('Erreur lors de la sauvegarde');
          }
      } catch (e) {
          console.error(e);
          alert('Erreur réseau');
      } finally {
          setSaving(false);
      }
  };

  const handleAddCoins = async (email: string, amount: number) => {
      try {
           const res = await fetch('/api/admin/coins', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-admin-password': 'stephadmin123@'
              },
              body: JSON.stringify({ email, amount })
          });
          if (res.ok) {
              alert('Coins ajoutés !');
              fetchData();
          } else {
              alert('Erreur');
          }
      } catch (e) {
          console.error(e);
      }
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
              <form onSubmit={handleLogin} className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl">
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                          <Lock className="w-8 h-8" />
                      </div>
                  </div>
                  <h1 className="text-2xl font-bold text-center mb-6">Accès Restreint</h1>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl mb-4 focus:border-red-500 outline-none transition-all"
                    placeholder="Mot de passe Admin"
                  />
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20">
                      Entrer
                  </button>
              </form>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" />
                Admin Dashboard
            </h1>
            <div className="flex gap-4">
                <button onClick={fetchData} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm hover:bg-neutral-800 transition-colors">
                    Actualiser
                </button>
                <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                    Déconnexion
                </button>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-2 relative z-10">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                         <Users className="w-5 h-5" />
                    </div>
                    <span className="text-neutral-400">Utilisateurs</span>
                </div>
                <p className="text-3xl font-bold relative z-10">{stats?.usersCount || 0}</p>
            </div>
             <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-2 relative z-10">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <Database className="w-5 h-5" />
                    </div>
                    <span className="text-neutral-400">Bots Actifs</span>
                </div>
                <p className="text-3xl font-bold relative z-10">{stats?.botsCount || 0}</p>
            </div>
             <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-2 relative z-10">
                     <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                        <Coins className="w-5 h-5" />
                     </div>
                    <span className="text-neutral-400">Coins totaux</span>
                </div>
                <p className="text-3xl font-bold relative z-10">{stats?.totalCoins || 0}</p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Global Settings */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-neutral-400" />
                    Configuration Système
                </h2>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Limite Globale de Bots</label>
                        <input 
                            type="number" 
                            value={settings.maxTotalBots}
                            onChange={(e) => setSettings({...settings, maxTotalBots: e.target.value})}
                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-blue-500 transition-colors"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Nombre maximum de bots simultanés sur le serveur.</p>
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Coût Création (Coins)</label>
                        <input 
                            type="number" 
                            value={settings.minCoinsToCreate}
                            onChange={(e) => setSettings({...settings, minCoinsToCreate: e.target.value})}
                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-yellow-500 transition-colors"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Prix pour lancer un nouveau bot.</p>
                    </div>

                     <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                            <span className="block text-sm font-medium">Mode Maintenance</span>
                            <span className="text-xs text-neutral-500">Bloque la création de nouveaux bots</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Sauvegarder
                    </button>
                </form>
            </div>

            {/* Add Coins */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-neutral-400" />
                    Créditer un compte
                </h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                    const amount = parseInt((form.elements.namedItem('amount') as HTMLInputElement).value);
                    handleAddCoins(email, amount);
                    form.reset();
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Email utilisateur</label>
                        <input name="email" type="email" className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-green-500 transition-colors" placeholder="user@example.com" required />
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Montant</label>
                        <input name="amount" type="number" className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-green-500 transition-colors" placeholder="1000" required />
                    </div>
                    <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-colors mt-2">
                        Ajouter les coins
                    </button>
                </form>
            </div>
        </div>

        {/* Users List */}
        <div className="max-w-7xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold">Gestion des Utilisateurs</h2>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Rechercher un utilisateur..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-blue-500 transition-colors w-full md:w-64"
                    />
                    <Users className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    {searching && <Activity className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />}
                </div>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                     <thead>
                         <tr className="border-b border-neutral-800 text-neutral-500 text-sm">
                             <th className="pb-3 pl-2">User</th>
                             <th className="pb-3">Email</th>
                             <th className="pb-3">Coins</th>
                             <th className="pb-3">Bots</th>
                             <th className="pb-3">Date</th>
                             <th className="pb-3 text-right pr-2">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm">
                         {users.map((u: any) => (
                             <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                 <td className="py-4 pl-2 font-medium">{u.username}</td>
                                 <td className="py-4 text-neutral-400">{u.email}</td>
                                 <td className="py-4 text-yellow-500 font-mono font-bold">{u.coins}</td>
                                 <td className="py-4">
                                     <span className="px-2 py-1 bg-neutral-800 rounded text-xs">{u.bots.length}</span>
                                 </td>
                                 <td className="py-4 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                 <td className="py-4 text-right pr-2">
                                     <button 
                                        onClick={() => handleDeleteUser(u.id, u.email)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Supprimer l'utilisateur"
                                     >
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                         {users.length === 0 && !searching && (
                             <tr>
                                 <td colSpan={6} className="py-8 text-center text-neutral-500">Aucun utilisateur trouvé</td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
        </div>
    </div>
  );
}