'use client';

import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ArrowRight, Box, Cpu, Shield, Zap, Menu, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <img src="https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            SenStudio<span className="text-indigo-600 dark:text-indigo-400">Host</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t('cta_login')}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {t('cta_start')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                    <div className="px-6 py-4 space-y-4 flex flex-col items-center">
                        <Link
                            href="/login"
                            className="w-full text-center py-2 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('cta_login')}
                        </Link>
                        <Link
                            href="/register"
                            className="w-full text-center px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all hover:shadow-lg hover:shadow-indigo-500/30"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('cta_start')}
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wide">
              <Zap className="w-3 h-3" />
              {t('version')}
            </motion.div>
            
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('description')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/login"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('hero_btn_start')}
                  <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Link>
              
              <Link
                href="#features"
                className="px-8 py-4 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-full font-bold text-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                {t('hero_btn_more')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract Visual (Placeholder for 3D/Motion) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 relative h-64 md:h-96 w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center"
          >
             <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-indigo-500/20" />
                ))}
             </div>
             <div className="text-center relative z-10 p-8 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                <p className="text-sm font-mono text-indigo-500 mb-2">{t('system_status')}</p>
                <div className="text-4xl font-bold font-mono tracking-widest text-neutral-800 dark:text-neutral-200">
                  {t('system_online')}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t('system_msg')}
                </div>
             </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: t('features.perf_title'), desc: t('features.perf_desc') },
              { icon: Shield, title: t('features.sec_title'), desc: t('features.sec_desc') },
              { icon: Zap, title: t('features.deploy_title'), desc: t('features.deploy_desc') },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 hover:border-indigo-500/50 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
