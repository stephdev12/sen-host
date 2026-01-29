'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ConfigureBotPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<{key: string, value: string}[]>([]);

  useEffect(() => {
    if (id) {
        fetch(`/api/bots/${id}/config`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load config');
                return res.json();
            })
            .then(data => {
                const vars = Object.entries(data.envVars || {}).map(([key, value]) => ({
                    key,
                    value: String(value)
                }));
                setEnvVars(vars);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddEnv = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const handleRemoveEnv = (index: number) => {
    const newVars = [...envVars];
    newVars.splice(index, 1);
    setEnvVars(newVars);
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...envVars];
    newVars[index][field] = value;
    setEnvVars(newVars);
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isBoolean = (val: string) => val === 'true' || val === 'false';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
        const envObj = envVars.reduce((acc, curr) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const res = await fetch(`/api/bots/${id}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ envVars: envObj })
        });

        if (!res.ok) throw new Error('Failed to save configuration');

        router.push('/dashboard');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Dashboard
        </Link>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Settings className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Configuration du Bot</h1>
                <Link 
                    href={`/dashboard/bots/${id}/enterprise`}
                    className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Auto-Réponses (Enterprise)
                </Link>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              Ajustez les paramètres détectés pour votre bot.
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {envVars.map((env, index) => {
                    const isBool = isBoolean(env.value);
                    return (
                        <div key={index} className="group relative bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <input 
                                    type="text" 
                                    value={env.key}
                                    onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                                    className="block w-full bg-transparent border-none p-0 text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider focus:ring-0 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
                                    placeholder="NEW_VARIABLE_KEY"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveEnv(index)}
                                    className="text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {isBool ? (
                                <div className="flex items-center gap-3 h-10">
                                    <button
                                        type="button"
                                        onClick={() => handleEnvChange(index, 'value', env.value === 'true' ? 'false' : 'true')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                            env.value === 'true' ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-700'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                env.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className="text-sm font-medium">
                                        {env.value === 'true' ? 'Activé (True)' : 'Désactivé (False)'}
                                    </span>
                                </div>
                            ) : (
                                <input 
                                    type="text" 
                                    value={env.value}
                                    onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                    placeholder="Value"
                                />
                            )}
                        </div>
                    );
                })}
                
                 {/* New Variable Placeholder */}
                 <button
                    type="button"
                    onClick={handleAddEnv}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-neutral-400 hover:text-indigo-500 h-full min-h-[100px]"
                 >
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-sm font-bold">Ajouter une Variable</span>
                 </button>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sauvegarde...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Sauvegarder et Appliquer
                        </>
                    )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
