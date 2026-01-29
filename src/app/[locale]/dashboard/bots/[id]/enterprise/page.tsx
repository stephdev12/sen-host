'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Plus, Trash2, 
  MessageSquare, Zap, Link as LinkIcon, X, 
  Image as ImageIcon, Film, MousePointer2
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface ResponseButton {
    id: string;
    text: string;
    type: 'url' | 'reply';
    payload: string; // URL or Reply Text
}

interface MediaItem {
    path: string; // Internal path
    name: string;
    type: 'image' | 'video';
}

interface ResponseRule {
    id?: string;
    keywords: string[];
    response: {
        content: string; // Text Caption
    };
    media: MediaItem[];
    buttons: ResponseButton[];
}

export default function EnterpriseConfigPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [enabled, setEnabled] = useState(true);
  const [responses, setResponses] = useState<ResponseRule[]>([]);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<ResponseRule>({
      keywords: [],
      response: { content: '' },
      media: [],
      buttons: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  
  // Button Builder State
  const [showBtnBuilder, setShowBtnBuilder] = useState(false);
  const [newBtn, setNewBtn] = useState<ResponseButton>({ id: '', text: '', type: 'reply', payload: '' });

  useEffect(() => {
    if (id) {
        fetch(`/api/bots/${id}/enterprise`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load config');
                return res.json();
            })
            .then(data => {
                setEnabled(data.enabled ?? true);
                setResponses(data.responses || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
        const res = await fetch(`/api/bots/${id}/enterprise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled, responses })
        });
        if (!res.ok) throw new Error('Failed to save configuration');
        // Optional: Show success toast
    } catch (err: any) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const formData = new FormData();
      formData.append('file', e.target.files[0]);

      try {
          const res = await fetch(`/api/bots/${id}/upload`, {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setCurrentRule(prev => ({
              ...prev,
              media: [...(prev.media || []), { path: data.path, name: data.name, type: data.type }]
          }));
      } catch (err: any) {
          setError("Upload failed: " + err.message);
      } finally {
          setUploading(false);
      }
  };

  const handleRemoveMedia = (idx: number) => {
      const newMedia = [...currentRule.media];
      newMedia.splice(idx, 1);
      setCurrentRule({ ...currentRule, media: newMedia });
  };

  const handleAddButton = () => {
      if (!newBtn.text || !newBtn.payload) return;
      setCurrentRule(prev => ({
          ...prev,
          buttons: [...(prev.buttons || []), { ...newBtn, id: crypto.randomUUID() }]
      }));
      setNewBtn({ id: '', text: '', type: 'reply', payload: '' });
      setShowBtnBuilder(false);
  };

  const handleRemoveButton = (idx: number) => {
      const newBtns = [...currentRule.buttons];
      newBtns.splice(idx, 1);
      setCurrentRule({ ...currentRule, buttons: newBtns });
  };

  // --- Standard CRUD Logic ---
  const handleAddKeyword = () => {
      if (!keywordInput.trim()) return;
      setCurrentRule({
          ...currentRule,
          keywords: [...currentRule.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
  };

  const handleRemoveKeyword = (idx: number) => {
      const newKeywords = [...currentRule.keywords];
      newKeywords.splice(idx, 1);
      setCurrentRule({ ...currentRule, keywords: newKeywords });
  };

  const handleSaveRule = () => {
      if (currentRule.keywords.length === 0) {
          setError("Ajoutez au moins un mot-clé.");
          return;
      }
      if (!currentRule.response.content && currentRule.media.length === 0) {
          setError("Ajoutez au moins du texte ou un média.");
          return;
      }

      const newResponses = [...responses];
      if (currentRule.id) {
          const idx = newResponses.findIndex(r => r.id === currentRule.id);
          if (idx !== -1) newResponses[idx] = currentRule;
      } else {
          newResponses.push({ ...currentRule, id: crypto.randomUUID() });
      }
      setResponses(newResponses);
      setIsEditing(false);
      setCurrentRule({ keywords: [], response: { content: '' }, media: [], buttons: [] });
      setError(null);
  };

  const handleDeleteRule = (ruleId: string) => {
      setResponses(responses.filter(r => r.id !== ruleId));
  };

  const startEdit = (rule: ResponseRule) => {
      // Ensure arrays exist
      setCurrentRule({
          ...rule,
          media: rule.media || [],
          buttons: rule.buttons || []
      });
      setIsEditing(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <Link 
            href={`/dashboard/bots/${id}/configure`}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
            <ArrowLeft className="w-4 h-4" />
            Retour
            </Link>
            
            <button 
                onClick={handleSaveAll}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sauvegarder tout
            </button>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="text-indigo-500" />
                        Réponses & Menus
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{enabled ? 'Activé' : 'Désactivé'}</span>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* LISTE DES RÈGLES */}
            {!isEditing && (
                <div className="p-6">
                    {responses.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Aucune réponse configurée.</p>
                            <button onClick={() => setIsEditing(true)} className="mt-4 text-indigo-500 font-bold hover:underline">Créer une réponse</button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {responses.map((rule, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {rule.keywords.map((k, i) => (
                                                <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold uppercase">
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {rule.response.content ? 'Texte' : 'Sans texte'}</span>
                                            {rule.media && rule.media.length > 0 && (
                                                <span className="flex items-center gap-1 text-emerald-500"><ImageIcon className="w-3 h-3" /> {rule.media.length} Média(s)</span>
                                            )}
                                            {rule.buttons && rule.buttons.length > 0 && (
                                                <span className="flex items-center gap-1 text-purple-500"><MousePointer2 className="w-3 h-3" /> {rule.buttons.length} Bouton(s)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEdit(rule)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg text-neutral-500">Modifier</button>
                                        <button onClick={() => handleDeleteRule(rule.id!)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setIsEditing(true)} className="w-full py-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 font-bold hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> Ajouter une règle
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* FORMULAIRE D'ÉDITION */}
            {isEditing && (
                <div className="p-6 bg-neutral-50 dark:bg-neutral-950/30">
                    <h3 className="text-lg font-bold mb-6">{currentRule.id ? 'Modifier la réponse' : 'Nouvelle réponse'}</h3>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* COLONNE GAUCHE : DÉCLENCHEURS & TEXTE */}
                        <div className="space-y-6">
                            {/* Keywords */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">1. Mots-clés Déclencheurs</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        placeholder="Ex: tarif, prix"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                                    />
                                    <button onClick={handleAddKeyword} className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-lg"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentRule.keywords.map((k, i) => (
                                        <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold flex items-center gap-1">
                                            {k}
                                            <button onClick={() => handleRemoveKeyword(i)}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Texte */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">2. Message (Légende)</label>
                                <textarea 
                                    value={currentRule.response.content}
                                    onChange={(e) => setCurrentRule({ ...currentRule, response: { ...currentRule.response, content: e.target.value } })}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 h-32"
                                    placeholder="Entrez le texte qui accompagnera les médias ou les boutons..."
                                />
                            </div>
                        </div>

                        {/* COLONNE DROITE : MÉDIAS & BOUTONS */}
                        <div className="space-y-6">
                            
                            {/* MEDIAS */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">3. Images / Vidéos (Optionnel)</label>
                                
                                <div className="space-y-2 mb-2">
                                    {currentRule.media?.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {m.type === 'image' ? <ImageIcon className="w-4 h-4 text-emerald-500" /> : <Film className="w-4 h-4 text-blue-500" />}
                                                <span className="text-sm truncate">{m.name}</span>
                                            </div>
                                            <button onClick={() => handleRemoveMedia(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>

                                <label className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : <span className="text-sm text-neutral-500 font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Uploader un fichier</span>}
                                </label>
                            </div>

                            {/* BOUTONS */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">4. Boutons Interactifs (Optionnel)</label>
                                
                                <div className="space-y-2 mb-2">
                                    {currentRule.buttons?.map((b, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                                            <div className="flex items-center gap-2">
                                                {b.type === 'url' ? <LinkIcon className="w-4 h-4 text-blue-500" /> : <MessageSquare className="w-4 h-4 text-purple-500" />}
                                                <div>
                                                    <p className="text-sm font-bold">{b.text}</p>
                                                    <p className="text-xs text-neutral-400 truncate max-w-[150px]">{b.payload}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveButton(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>

                                {!showBtnBuilder ? (
                                    <button onClick={() => setShowBtnBuilder(true)} className="w-full p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm font-bold">+ Ajouter un bouton</button>
                                ) : (
                                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setNewBtn({ ...newBtn, type: 'reply' })}
                                                className={`flex-1 py-1 text-xs font-bold rounded ${newBtn.type === 'reply' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'}`}
                                            >
                                                Simple (Reply)
                                            </button>
                                            <button 
                                                onClick={() => setNewBtn({ ...newBtn, type: 'url' })}
                                                className={`flex-1 py-1 text-xs font-bold rounded ${newBtn.type === 'url' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-500'}`}
                                            >
                                                Lien (URL)
                                            </button>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Texte du bouton (ex: Voir Site)"
                                            className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                                            value={newBtn.text}
                                            onChange={(e) => setNewBtn({ ...newBtn, text: e.target.value })}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder={newBtn.type === 'url' ? "https://mon-site.com" : "Message envoyé au clic (ex: tarif)"}
                                            className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                                            value={newBtn.payload}
                                            onChange={(e) => setNewBtn({ ...newBtn, payload: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddButton} className="flex-1 py-1 bg-indigo-600 text-white text-sm rounded">Ajouter</button>
                                            <button onClick={() => setShowBtnBuilder(false)} className="px-3 py-1 bg-neutral-200 text-neutral-600 text-sm rounded">Annuler</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
                        <button onClick={handleSaveRule} className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Valider la règle</button>
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg font-bold">Annuler</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}