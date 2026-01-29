'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Loader2, Trash2, ArrowLeft, Bot, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    image: string | null;
    createdAt: string;
    user: {
        username: string;
        role: string;
    };
}

export default function CommunityPage() {
    const t = useTranslations('community');
    const d = useTranslations('Dashboard');
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/me')
          .then(res => res.json())
          .then(data => {
              if (data.error) router.push('/login');
              else setUser(data);
          });
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/community/messages');
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('content', newMessage);
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        try {
            const res = await fetch('/api/community/messages', {
                method: 'POST',
                body: formData,
            });
            
            if (res.ok) {
                setNewMessage('');
                setSelectedImage(null);
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
                    <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.overview')}</Link>
                    <Link href="/dashboard/billing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.billing')}</Link>
                    <Link href="/dashboard/community" className="text-neutral-900 dark:text-neutral-100">{d('nav.community')}</Link>
                    <Link href="/dashboard/help" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">{d('nav.help')}</Link>
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

            <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto h-screen flex flex-col">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </Link>

                <div className="mb-4">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-neutral-500 text-sm">{t('subtitle')}</p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4 mb-4 shadow-sm custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-neutral-400">
                            {t('empty')}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.user.username === user?.username ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`font-bold text-sm ${msg.user.role === 'admin' ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        {msg.user.username}
                                        {msg.user.role === 'admin' && ' (Admin)'}
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className={`p-1.5 rounded-2xl max-w-[80%] shadow-sm ${
                                    msg.user.username === user?.username 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-tl-none'
                                }`}>
                                    {msg.image && (
                                        <div className="mb-1 relative overflow-hidden rounded-xl">
                                             <img 
                                                src={msg.image} 
                                                alt="Attachment" 
                                                className="w-full h-auto object-contain max-h-[400px] bg-black/5 dark:bg-white/5 cursor-pointer"
                                                loading="lazy"
                                                onClick={() => window.open(msg.image!, '_blank')}
                                            />
                                        </div>
                                    )}
                                    {msg.content && (
                                        <p className={`whitespace-pre-wrap break-words text-sm px-2 pb-1 ${msg.image ? 'mt-1' : ''}`}>
                                            {msg.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-2 items-end shadow-sm">
                    <div className="flex-1">
                        {selectedImage && (
                            <div className="flex items-center gap-2 mb-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg w-fit">
                                <span className="text-xs truncate max-w-[200px]">{selectedImage.name}</span>
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedImage(null)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('placeholder')}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] py-2 outline-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>
                    
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setSelectedImage(e.target.files[0]);
                            }
                        }}
                    />
                    
                    <button
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="p-2 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>

                    <button
                        type="submit"
                        disabled={loading || (!newMessage.trim() && !selectedImage)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </main>
        </div>
    );
}
