/**
 * 𝗦𝗘𝗡 Bot - Services Command
 * Affichage des services avec système de navigation
 */

import StephUI from 'stephtech-ui';
import chalk from 'chalk';

// --- CONFIGURATION DES SERVICES ---
const SERVICES_CONFIG = {
    main: {
        image: 'https://i.postimg.cc/522nVNj6/sen-logo-light.jpg',
        title: '*SEN STUDIO - NOS SERVICES*',
        description: '✨ Découvrez nos services professionnels\n\n_Cliquez sur un service pour en savoir plus_',
        footer: 'BY SEN STUDIO'
    },
    
    graphisme: {
        id: 'graphisme',
        title: '🎨 GRAPHISME & DESIGN',
        image: 'https://i.postimg.cc/qqBC3qPg/sen-design.jpg',
        description: `*🎨 SERVICE GRAPHISME*\n\n` +
            `Nous créons des designs professionnels qui captivent votre audience :\n\n` +
            `✓ Logos & Identité visuelle\n` +
            `✓ Flyers & Affiches\n` +
            `✓ Posts réseaux sociaux\n` +
            `✓ Bannières & Couvertures\n` +
            `✓ Mockups & Présentations\n\n` +
            `💎 *Qualité professionnelle garantie*\n` +
            `⚡ *Livraison rapide*\n` +
            `🔄 *Révisions illimitées*`,
        ctaText: '📞 COMMANDER',
        whatsappMessage: 'Bonjour SEN Studio ! Je suis intéressé(e) par vos services de *Graphisme & Design*. J\'aimerais en savoir plus.',
        footer: '🎨 SEN DESIGN'
    },
    
    web: {
        id: 'web',
        title: '💻 DÉVELOPPEMENT WEB',
        image: 'https://i.postimg.cc/Kz8Z7TYT/1764402898028.png',
        description: `*💻 SERVICE DÉVELOPPEMENT WEB*\n\n` +
            `Création de sites web modernes et performants :\n\n` +
            `✓ Sites vitrines professionnels\n` +
            `✓ E-commerce (boutiques en ligne)\n` +
            `✓ Applications web sur mesure\n` +
            `✓ Landing pages optimisées\n` +
            `✓ Design responsive (mobile-friendly)\n\n` +
            `🚀 *Technologies modernes*\n` +
            `📱 *100% Responsive*\n` +
            `⚡ *Performance optimale*`,
        ctaText: '🌐 DEMANDER UN DEVIS',
        whatsappMessage: 'Bonjour SEN Studio ! Je souhaite créer un site web. Pouvez-vous me faire un devis pour mon projet de *Développement Web* ?',
        footer: '💻 SEN WEB DEV'
    },
    
    automatisation: {
        id: 'automatisation',
        title: '🤖 AUTOMATISATION',
        image: 'https://i.postimg.cc/nc4hJpNx/sen-logo-dark.jpg',
        description: `*🤖 SERVICE AUTOMATISATION*\n\n` +
            `Automatisez vos tâches et gagnez du temps :\n\n` +
            `✓ Bots WhatsApp personnalisés\n` +
            `✓ Automatisation de processus\n` +
            `✓ Scripts & outils sur mesure\n` +
            `✓ Intégrations API\n` +
            `✓ Systèmes de gestion automatisés\n\n` +
            `⚙️ *Solutions sur mesure*\n` +
            `🔧 *Support technique inclus*\n` +
            `📈 *Optimisation continue*`,
        ctaText: '🤖 EN SAVOIR PLUS',
        whatsappMessage: 'Bonjour SEN Studio ! Je suis intéressé(e) par vos services d\'*Automatisation*. J\'aimerais automatiser certaines tâches.',
        footer: '🤖 SEN AUTOMATION'
    }
};

// Import des configs pour récupérer automatiquement le numéro
import configs from '../configs.js';

// Récupération automatique du numéro depuis configs
const WHATSAPP_NUMBER = (configs.ownerNumber || configs.phoneNumber || '').replace(/[^0-9]/g, '');

// --- COMMANDE PRINCIPALE: .services ---
export async function servicesCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    
    try {
        await sock.sendMessage(chatId, { react: { text: '💼', key: message.key } });
        
        const config = SERVICES_CONFIG.main;
        
        await ui.buttons(chatId, {
            text: `${config.title}\n\n${config.description}`,
            footer: config.footer,
            image: config.image,
            buttons: [
                { 
                    id: 'service_graphisme', 
                    text: '🎨 Graphisme' 
                },
                { 
                    id: 'service_web', 
                    text: '💻 Dév. Web' 
                },
                { 
                    id: 'service_automatisation', 
                    text: '🤖 Automatisation' 
                }
            ],
            quoted: message
        });
        
        console.log(chalk.green('✅ Services menu sent'));
        
    } catch (error) {
        console.error(chalk.red('Error in servicesCommand:'), error.message);
        await sock.sendMessage(chatId, { 
            text: '❌ Erreur lors de l\'affichage des services.' 
        }, { quoted: message });
    }
}

// --- GESTIONNAIRE DES CLICS SUR LES SERVICES ---
export async function handleServiceClick(sock, chatId, message, serviceId) {
    const ui = new StephUI(sock);
    
    try {
        // Extraire le nom du service (ex: "service_graphisme" -> "graphisme")
        const serviceName = serviceId.replace('service_', '');
        
        // Récupérer la config du service
        const service = SERVICES_CONFIG[serviceName];
        
        if (!service) {
            console.error(chalk.red(`Service "${serviceName}" not found`));
            return;
        }
        
        await sock.sendMessage(chatId, { react: { text: '✨', key: message.key } });
        
        // Créer le lien WhatsApp avec message pré-rempli
        const encodedMessage = encodeURIComponent(service.whatsappMessage);
        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Envoyer l'image avec description et bouton CTA
        await ui.urlButtons(chatId, {
            text: service.description,
            footer: service.footer,
            image: service.image,
            buttons: [
                {
                    text: service.ctaText,
                    url: whatsappLink
                }
            ],
            quoted: message
        });
        
        console.log(chalk.green(`✅ Service "${serviceName}" details sent`));
        
    } catch (error) {
        console.error(chalk.red('Error in handleServiceClick:'), error.message);
        await sock.sendMessage(chatId, { 
            text: '❌ Erreur lors de l\'affichage du service.' 
        }, { quoted: message });
    }
}

export default { servicesCommand, handleServiceClick };