'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { 
  ArrowLeft, 
  Github, 
  Upload, 
  Terminal, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  AlertTriangle,
  FileCode,
  Settings
} from 'lucide-react';

export default function CustomBotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<'GIT' | 'ZIP'>('GIT');
  const [repoUrl, setRepoUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [startCommand, setStartCommand] = useState('npm start');
  
  // Env Vars State
  const [envVars, setEnvVars] = useState<{key: string, value: string}[]>([
    { key: 'PORT', value: '8080' },
    { key: 'SESSION_ID', value: '' }
  ]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
          setUser(data);
          setCheckingAuth(false);
      });
  }, []);

  // Removed Payment Logic

  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert env vars to object
      const envObj = envVars.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      // Prepare payload
      let body;
      const headers: Record<string, string> = {};

      if (sourceType === 'GIT') {
          // Send JSON for GIT (More stable)
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({
              name,
              sourceType,
              startCommand,
              repoUrl,
              envVars: envObj
          });
      } else {
          // Send FormData for ZIP
          const formData = new FormData();
          formData.append('name', name);
          formData.append('sourceType', sourceType);
          formData.append('startCommand', startCommand);
          if (zipFile) {
            formData.append('zipFile', zipFile);
          }
          formData.append('envVars', JSON.stringify(envObj));
          body = formData;
      }

      const res = await fetch('/api/bots/create-custom', {
        method: 'POST',
        headers,
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
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
                    <FileCode className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Déployer un Bot Personnalisé</h1>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              Importez votre propre code bot WhatsApp depuis GitHub ou un fichier ZIP.
              <br/>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded ml-1 font-bold">BÊTA</span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* 1. Basic Info */}
            <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm">1</span>
                    Informations Générales
                </h3>
                <div className="space-y-4 ml-8">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom du Bot</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Mon Super Bot"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* 2. Source Code */}
            <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm">2</span>
                    Code Source
                </h3>
                <div className="ml-8">
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setSourceType('GIT')}
                            className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${sourceType === 'GIT' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'}`}
                        >
                            <Github className="w-5 h-5" />
                            GitHub Repository
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceType('ZIP')}
                            className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${sourceType === 'ZIP' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'}`}
                        >
                            <Upload className="w-5 h-5" />
                            Fichier ZIP
                        </button>
                    </div>

                    {sourceType === 'GIT' ? (
                         <div>
                            <label className="block text-sm font-medium mb-1">URL du Dépôt Git</label>
                            <input 
                                type="url" 
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="https://github.com/username/my-bot.git"
                                required={sourceType === 'GIT'}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1">Upload Archive (.zip)</label>
                            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".zip"
                                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    required={sourceType === 'ZIP'}
                                />
                                <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                                <p className="text-sm text-neutral-500">
                                    {zipFile ? zipFile.name : "Cliquez ou glissez votre fichier ici"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Configuration */}
            <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm">3</span>
                    Configuration Technique
                </h3>
                <div className="ml-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Commande de Démarrage</label>
                        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-2">
                            <Terminal className="w-4 h-4 text-neutral-500" />
                            <input 
                                type="text" 
                                value={startCommand}
                                onChange={(e) => setStartCommand(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
                                placeholder="npm start"
                            />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Par défaut: <code className="bg-neutral-200 dark:bg-neutral-800 px-1 rounded">npm start</code> ou <code className="bg-neutral-200 dark:bg-neutral-800 px-1 rounded">node index.js</code></p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium">Variables d&apos;Environnement (.env)</label>
                            <button 
                                type="button" 
                                onClick={handleAddEnv}
                                className="text-xs flex items-center gap-1 text-indigo-500 font-bold hover:text-indigo-600"
                            >
                                <Plus className="w-3 h-3" /> Ajouter Variable
                            </button>
                        </div>
                        
                        <div className="space-y-2 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            {envVars.map((env, index) => (
                                <div key={index} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={env.key}
                                        onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                                        placeholder="KEY (ex: SESSION_ID)"
                                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono"
                                    />
                                    <span className="self-center text-neutral-400">=</span>
                                    <input 
                                        type="text" 
                                        value={env.value}
                                        onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                                        placeholder="VALUE"
                                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveEnv(index)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {envVars.length === 0 && (
                                <p className="text-center text-xs text-neutral-400 py-2">Aucune variable définie.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading || (user?.coins < 15)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Déploiement...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Importer (15 Coins)
                        </>
                    )}
                </button>
            </div>
            {user?.coins < 15 && (
                <p className="text-right text-red-500 text-sm mt-2">Vous avez besoin de 15 coins (Solde: {user.coins})</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
