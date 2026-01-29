'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Github, 
  Upload, 
  Loader2, 
  FileCode, 
  Shield,
  Edit,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      sourceType: 'GIT',
      repoUrl: '',
      zipFile: null as File | null,
      startCommand: '',
      envFileName: '.env'
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editEnvVars, setEditEnvVars] = useState<{key: string, value: string}[]>([]);

  const checkAuth = () => {
      const stored = sessionStorage.getItem('admin_pwd');
      if (stored === 'stephadmin123@') {
          setIsAuthenticated(true);
          setPassword(stored);
          fetchTemplates();
      }
  };

  useEffect(() => {
      checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'stephadmin123@') {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_pwd', password);
        fetchTemplates();
    } else {
        alert('Mot de passe incorrect');
    }
  };

  const fetchTemplates = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/templates', {
              headers: { 'x-admin-password': 'stephadmin123@' }
          });
          if (res.ok) {
              setTemplates(await res.json());
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: string, name: string, isLegacy: boolean) => {
      if (isLegacy) {
          alert("Impossible de supprimer un template local directement. Supprimez le dossier manuellement.");
          return;
      }
      if (!confirm(`Supprimer le template "${name}" ? Cette action est irréversible et supprimera les fichiers.`)) return;
      
      try {
          const res = await fetch(`/api/admin/templates?id=${id}`, {
              method: 'DELETE',
              headers: { 'x-admin-password': 'stephadmin123@' }
          });
          if (res.ok) {
              fetchTemplates();
          } else {
              alert('Erreur lors de la suppression');
          }
      } catch (e) {
          alert('Erreur réseau');
      }
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
          let body;
          const headers: Record<string, string> = { 'x-admin-password': 'stephadmin123@' };

          if (formData.sourceType === 'GIT') {
              headers['Content-Type'] = 'application/json';
              body = JSON.stringify({
                  name: formData.name,
                  description: formData.description,
                  sourceType: 'GIT',
                  repoUrl: formData.repoUrl,
                  startCommand: formData.startCommand,
                  envFileName: formData.envFileName
              });
          } else {
              const data = new FormData();
              data.append('name', formData.name);
              data.append('description', formData.description);
              data.append('sourceType', 'ZIP');
              data.append('startCommand', formData.startCommand);
              data.append('envFileName', formData.envFileName);
              if (formData.zipFile) data.append('zipFile', formData.zipFile);
              body = data;
          }

          const res = await fetch('/api/admin/templates', {
              method: 'POST',
              headers,
              body
          });

          if (res.ok) {
              setIsModalOpen(false);
              setFormData({ name: '', description: '', sourceType: 'GIT', repoUrl: '', zipFile: null, startCommand: '', envFileName: '.env' });
              fetchTemplates();
          } else {
              const err = await res.json();
              alert(err.error || 'Erreur');
          }
      } catch (e) {
          alert('Erreur réseau');
      } finally {
          setCreating(false);
      }
  };

  const openEditModal = (template: any) => {
      setEditData(template);
      let vars = [];
      try {
          const parsed = JSON.parse(template.envVars || '{}');
          vars = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      } catch (e) {}
      setEditEnvVars(vars);
      setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setEditing(true);
      try {
          // Reconstruct env vars
          const envObj = editEnvVars.reduce((acc, curr) => {
              if (curr.key) acc[curr.key] = curr.value;
              return acc;
          }, {} as Record<string, string>);

          const res = await fetch('/api/admin/templates', {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-admin-password': 'stephadmin123@'
              },
              body: JSON.stringify({
                  id: editData.isLegacy ? null : editData.id,
                  folderName: editData.folderName,
                  isLegacy: editData.isLegacy,
                  name: editData.name,
                  description: editData.description,
                  sessionIdUrl: editData.sessionIdUrl,
                  startCommand: editData.startCommand,
                  envFileName: editData.envFileName,
                  envVars: envObj
              })
          });

          if (res.ok) {
              setIsEditModalOpen(false);
              fetchTemplates();
          } else {
              alert('Erreur lors de la mise à jour');
          }
      } catch (e) {
          console.error(e);
          alert('Erreur réseau');
      } finally {
          setEditing(false);
      }
  };

  const addEnvVar = () => setEditEnvVars([...editEnvVars, { key: '', value: '' }]);
  const removeEnvVar = (index: number) => setEditEnvVars(editEnvVars.filter((_, i) => i !== index));
  const updateEnvVar = (index: number, field: 'key' | 'value', val: string) => {
      const newVars = [...editEnvVars];
      newVars[index][field] = val;
      setEditEnvVars(newVars);
  };

  if (!isAuthenticated) {
      // ... Login Form (Same as before)
      return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
              <form onSubmit={handleLogin} className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl">
                   {/* ... Same JSX ... */}
                   <div className="flex justify-center mb-6">
                      <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                          <Shield className="w-8 h-8" />
                      </div>
                  </div>
                  <h1 className="text-2xl font-bold text-center mb-6">Admin Templates</h1>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl mb-4 focus:border-red-500 outline-none transition-all"
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
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/steph" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <FileCode className="w-8 h-8 text-indigo-500" />
                    Gestion des Templates
                </h1>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Ajouter
            </button>
        </header>

        <div className="max-w-7xl mx-auto">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className={`bg-neutral-900 border rounded-2xl p-6 group transition-all ${template.isLegacy ? 'border-yellow-500/30 bg-yellow-900/10' : 'border-neutral-800 hover:border-indigo-500/50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${template.isLegacy ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-950 text-indigo-500'}`}>
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openEditModal(template)}
                                        className="p-2 text-neutral-500 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(template.id, template.name, template.isLegacy)}
                                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{template.description || 'Aucune description'}</p>
                            
                            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
                                <span className={`px-2 py-1 rounded uppercase ${template.isLegacy ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-950'}`}>
                                    {template.isLegacy ? 'LOCAL DETECTED' : template.sourceType}
                                </span>
                                <span className="truncate flex-1">{template.folderName}</span>
                            </div>
                            {template.isLegacy && (
                                <div className="text-xs text-yellow-500 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Non géré (Cliquez sur Edit pour importer)
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {templates.length === 0 && (
                        <div className="col-span-full text-center py-20 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-2xl">
                            Aucun template configuré.
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6">Ajouter un Template</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* ... Existing Create Form ... */}
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Nom du Template</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Description</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                            />
                        </div>

                        <div>
                             <label className="block text-sm text-neutral-400 mb-2">Commande de Démarrage (Optionnel)</label>
                             <input 
                                 type="text" 
                                 value={formData.startCommand}
                                 onChange={(e) => setFormData({...formData, startCommand: e.target.value})}
                                 placeholder="node index.js"
                                 className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                             />
                             <p className="text-xs text-neutral-600 mt-1">Laissez vide pour détecter automatiquement (package.json) ou utiliser &quot;node index.js&quot;.</p>
                        </div>
                        
                        <div>
                             <label className="block text-sm text-neutral-400 mb-2">Nom du Fichier d&apos;Environnement</label>
                             <input 
                                 type="text" 
                                 value={formData.envFileName}
                                 onChange={(e) => setFormData({...formData, envFileName: e.target.value})}
                                 placeholder=".env"
                                 className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                             />
                             <p className="text-xs text-neutral-600 mt-1">Ex: .env, set.env, config.env</p>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, sourceType: 'GIT'})}
                                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.sourceType === 'GIT' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-neutral-800 hover:border-neutral-700'}`}
                            >
                                <Github className="w-5 h-5" /> Git
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, sourceType: 'ZIP'})}
                                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.sourceType === 'ZIP' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-neutral-800 hover:border-neutral-700'}`}
                            >
                                <Upload className="w-5 h-5" /> ZIP
                            </button>
                        </div>

                        {formData.sourceType === 'GIT' ? (
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">URL du Dépôt</label>
                                <input 
                                    type="url" 
                                    value={formData.repoUrl}
                                    onChange={(e) => setFormData({...formData, repoUrl: e.target.value})}
                                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="https://github.com/..."
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Fichier ZIP</label>
                                <input 
                                    type="file" 
                                    accept=".zip"
                                    onChange={(e) => setFormData({...formData, zipFile: e.target.files?.[0] || null})}
                                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-4 mt-8">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                disabled={creating}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {creating && <Loader2 className="w-5 h-5 animate-spin" />}
                                {creating ? 'Installation...' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editData && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl my-8">
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold">
                             {editData.isLegacy ? 'Importer & Configurer' : 'Modifier Template'}
                         </h2>
                         <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-500 hover:text-white">
                             <X className="w-6 h-6" />
                         </button>
                    </div>
                   
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Nom</label>
                                <input 
                                    type="text" 
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Dossier (Read Only)</label>
                                <input 
                                    type="text" 
                                    value={editData.folderName}
                                    readOnly
                                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl outline-none text-neutral-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                                                    <div>
                                                        <label className="block text-sm text-neutral-400 mb-2">Description</label>
                                                        <textarea 
                                                            value={editData.description}
                                                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                                                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors h-20 resize-none"
                                                        />
                                                    </div>
                        
                                                    <div>
                                                        <label className="block text-sm text-neutral-400 mb-2">URL Session ID (Aide)</label>
                                                        <input 
                                                            type="url" 
                                                            value={editData.sessionIdUrl || ''}
                                                            onChange={(e) => setEditData({...editData, sessionIdUrl: e.target.value})}
                                                            placeholder="https://..."
                                                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                                                        />
                                                        <p className="text-xs text-neutral-600 mt-1">Lien vers le tutoriel pour obtenir le Session ID (affiché à l&apos;utilisateur)</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-neutral-400 mb-2">Commande de Démarrage</label>
                                                        <input 
                                                            type="text" 
                                                            value={editData.startCommand || ''}
                                                            onChange={(e) => setEditData({...editData, startCommand: e.target.value})}
                                                            placeholder="node index.js"
                                                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-neutral-400 mb-2">Nom du Fichier d&apos;Environnement</label>
                                                        <input 
                                                            type="text" 
                                                            value={editData.envFileName || '.env'}
                                                            onChange={(e) => setEditData({...editData, envFileName: e.target.value})}
                                                            placeholder=".env"
                                                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                                                        />
                                                    </div>
                        
                                                {/* Env Vars Editor */}                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-neutral-400">Variables d&apos;Environnement</label>
                                <button type="button" onClick={addEnvVar} className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Ajouter
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {editEnvVars.map((env, idx) => (
                                    <div key={idx} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg group hover:border-indigo-500/30 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 border-b border-neutral-800 pb-2">
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Key</span>
                                            <input 
                                                type="text" 
                                                value={env.key} 
                                                onChange={(e) => updateEnvVar(idx, 'key', e.target.value)}
                                                placeholder="KEY"
                                                className="flex-1 bg-transparent border-none p-0 text-xs font-mono font-bold text-indigo-400 focus:ring-0 outline-none placeholder-indigo-500/30"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeEnvVar(idx)}
                                                className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all flex items-center justify-center"
                                                title="Supprimer la variable"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <input 
                                                type="text" 
                                                value={env.value} 
                                                onChange={(e) => updateEnvVar(idx, 'value', e.target.value)}
                                                placeholder="Value"
                                                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-300 focus:border-indigo-500 outline-none transition-colors placeholder-neutral-700"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {editEnvVars.length === 0 && <p className="text-xs text-neutral-600 text-center py-8">Aucune variable configurée</p>}
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                Ces variables définiront la configuration par défaut lors de la création d&apos;un bot.
                                Supprimez celles qui sont inutiles pour l&apos;utilisateur final.
                            </p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button 
                                type="button" 
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                disabled={editing}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {editing && <Loader2 className="w-5 h-5 animate-spin" />}
                                {editing ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}
    </div>
  );
}
