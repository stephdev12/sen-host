'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Database, Coins, Lock } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'stephadmin123@') {
        setIsAuthenticated(true);
        fetchStats();
    } else {
        alert('Mot de passe incorrect');
    }
  };

  const fetchStats = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/stats', {
              headers: { 'x-admin-password': 'stephadmin123@' } // Simple protection for API
          });
          const data = await res.json();
          setStats(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
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
              fetchStats();
          } else {
              alert('Erreur');
          }
      } catch (e) {
          console.error(e);
      }
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
              <form onSubmit={handleLogin} className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm">
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
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl mb-4 focus:border-red-500 outline-none"
                    placeholder="Mot de passe Admin"
                  />
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors">
                      Entrer
                  </button>
              </form>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" />
                Admin Dashboard
            </h1>
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-neutral-800 rounded-lg text-sm">Déconnexion</button>
        </header>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-neutral-400">Utilisateurs</span>
                </div>
                <p className="text-3xl font-bold">{stats?.usersCount || 0}</p>
            </div>
             <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-2">
                    <Database className="w-5 h-5 text-green-500" />
                    <span className="text-neutral-400">Bots Actifs</span>
                </div>
                <p className="text-3xl font-bold">{stats?.botsCount || 0}</p>
            </div>
             <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-neutral-400">Coins en circulation</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalCoins || 0}</p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Ajouter des Coins</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const amount = parseInt((form.elements.namedItem('amount') as HTMLInputElement).value);
                handleAddCoins(email, amount);
                form.reset();
            }} className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm text-neutral-400 mb-1">Email utilisateur</label>
                    <input name="email" type="email" className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-red-500" placeholder="user@example.com" required />
                </div>
                <div className="w-48">
                    <label className="block text-sm text-neutral-400 mb-1">Montant</label>
                     <input name="amount" type="number" className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-red-500" placeholder="1000" required />
                </div>
                <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors">Ajouter</button>
            </form>
        </div>

        {/* Users List */}
        <div className="max-w-7xl mx-auto mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
             <h2 className="text-xl font-bold mb-6">Utilisateurs récents</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead>
                         <tr className="border-b border-neutral-800 text-neutral-500 text-sm">
                             <th className="pb-3">User</th>
                             <th className="pb-3">Email</th>
                             <th className="pb-3">Coins</th>
                             <th className="pb-3">Bots</th>
                             <th className="pb-3">Date</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm">
                         {stats?.users?.map((u: any) => (
                             <tr key={u.id} className="border-b border-neutral-800/50">
                                 <td className="py-3 font-medium">{u.username}</td>
                                 <td className="py-3 text-neutral-400">{u.email}</td>
                                 <td className="py-3 text-yellow-500 font-mono">{u.coins}</td>
                                 <td className="py-3">{u.bots.length}</td>
                                 <td className="py-3 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    </div>
  );
}
