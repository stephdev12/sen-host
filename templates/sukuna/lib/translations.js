// lib/translations.js

const translations = {
    fr: {
        // Messages d'erreur
        error_group_only: "Cette commande ne peut être utilisée qu'en groupe.",
        error_admin_only: "Vous devez être admin pour utiliser cette commande.",
        error_owner_only: "Cette commande est réservée au propriétaire du bot.",
        error_invalid_usage: "Utilisation invalide. Utilisez",
        error_not_found: "Non trouvé",
        error_occurred: "Une erreur s'est produite",
        
        // Messages de succès
        success_activated: "activé avec succès",
        success_deactivated: "désactivé avec succès",
        success_updated: "mis à jour avec succès",
        success_reset: "réinitialisé avec succès",
        
        // Welcome/Goodbye
        welcome_default: "👋 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐮𝐞",
        welcome_in_group: "Bienvenue dans",
        goodbye_default: "👋 𝐀𝐮 𝐫𝐞𝐯𝐨𝐢𝐫",
        goodbye_left_group: "Un membre a quitté",
        members: "Membres",
        description: "Description",
        no_description: "Aucune description",
        enjoy_stay: "Profitez bien de votre séjour !",
        hope_see_again: "Nous espérons vous revoir bientôt !",
        
        // Warnings
        warnings_title: "Avertissements de",
        warnings_group_title: "Avertissements du groupe",
        warnings_reset: "Avertissements réinitialisés pour",
        warnings_reset_all: "Tous les avertissements ont été réinitialisés",
        warnings_none: "Aucun avertissement dans ce groupe",
        antilink_label: "Antilink",
        antispam_label: "Antispam",
        
        // Configuration
        config_prefix: "Préfixe",
        config_botname: "Nom du bot",
        config_language: "Langue",
        config_current: "Configuration actuelle",
        config_updated: "Configuration mise à jour",
        config_usage: "Utilisation",
        config_example: "Exemple",
        
        // Antilink
        antilink_enabled: "La protection anti-lien est maintenant activée",
        antilink_disabled: "La protection anti-lien est maintenant désactivée",
        antilink_detected: "Lien détecté de",
        antilink_warning: "Avertissement",
        antilink_kicked: "expulsé pour liens répétitifs",
        
        // Antispam
        antispam_detected: "SPAM DÉTECTÉ ! Tous les messages supprimés",
        antispam_kicked: "expulsé pour spam répétitif",
        
        // Protection
        protection_status: "Statut de",
        protection_enabled: "activé ✅",
        protection_disabled: "désactivé ❌",
        
        // Divers
        session: "Session",
        status: "Statut",
        total: "Total",
        user: "utilisateur",
        users: "utilisateurs",
        remaining_days: "Jours restants",

        group_link_text: "🔗 Voici l'invitation pour rejoindre notre territoire :\n\n{link}",
        lock_feature: "Verrouillage groupe",
        unlock_feature: "Déverrouillage groupe", 
        members_kicked: "{count} membres expulsés",
        members_to_kick: "membres à expulser",
        user_added: "Utilisateur ajouté",
        member_kicked: "Membre expulsé",
        member_promoted: "Membre promu admin", 
        member_demoted: "Membre rétrogradé",
        welcome_feature: "Bienvenue",
        goodbye_feature: "Au revoir",

        // Pour tagall.js
        tagall_message: "ᴀᴛᴛᴇɴᴛɪᴏɴ ᴀ ᴛᴏᴜꜱ!",

        // Pour alive.js  
        alive_status: "sukuna en ʟɪɢɴᴇ ᴅᴇᴘᴜɪꜱ {hours}ʜ{minutes}ᴍ",

        // Pour antilink.js
        antilink_enabled: "La protection anti-lien est maintenant activée !\n\n• Session: {phoneNumber}\n• Les utilisateurs seront expulsés après {threshold} avertissements",
        antilink_disabled: "La protection anti-lien est maintenant désactivée !\n\n• Session: {phoneNumber}",

        // Pour antimention.js
        antimention_enabled: "La protection anti-mention est maintenant activée !\n\n• Session: {phoneNumber}\n• Bloque toute mention du groupe\n• Les messages avec mention seront supprimés",
        antimention_disabled: "La protection anti-mention est maintenant désactivée !\n\n• Session: {phoneNumber}",

        error_owner_only: "Cette commande ne peut être utilisée qu'en privé par le propriétaire du bot.",
        upload_in_progress: "⏳ Téléchargement de l'image en cours...",
        upload_failed: "Échec du téléchargement de l'image",

        // setmenuimage.js
        setmenuimage_help: "🖼️ **Configuration de l'image du menu**\n\n**Image actuelle:**\n{currentImage}\n\n**Usage:**\n• {prefix}setmenuimage <url>\n• Répondre à une image avec {prefix}setmenuimage\n\n**Exemple:**\n{prefix}setmenuimage https://i.postimg.cc/image.jpg\n\n**Réinitialiser:** {prefix}setmenuimage reset\n\n💡 Vous pouvez utiliser une URL ou répondre à une image directement.\n\n📱 Session: {phoneNumber}",
        setmenuimage_reset: "✅ Image du menu réinitialisée!\n\nImage par défaut restaurée.\n\n📱 Session: {phoneNumber}",
        setmenuimage_upload_success: "✅ Image du menu mise à jour!\n\n**Nouvelle image définie avec succès!**\n\n💡 L'image sera utilisée pour la commande menu.\n\n📱 Session: {phoneNumber}",
        setmenuimage_upload_error: "❌ Erreur lors du traitement de l'image\n\n{error}\n\nVeuillez réessayer ou utiliser une URL directe.",
        setmenuimage_url_success: "✅ Image du menu mise à jour!\n\n**Nouvelle URL:**\n{url}\n\n💡 L'image sera utilisée pour la commande menu.\n\n📱 Session: {phoneNumber}",
        setmenuimage_url_error: "❌ Erreur lors de la configuration de l'image\n\n{error}\n\nL'URL doit commencer par http:// ou https://\nImage actuelle: {currentImage}",

        // setephotoimage.js  
        setephotoimage_help: "🎨 **Configuration de l'image Ephoto360**\n\n**Image actuelle:**\n{currentImage}\n\n**Usage:**\n• {prefix}setephotoimage <url>\n• Répondre à une image avec {prefix}setephotoimage\n\n**Exemple:**\n{prefix}setephotoimage https://i.postimg.cc/image.jpg\n\n**Réinitialiser:** {prefix}setephotoimage reset\n\n💡 Vous pouvez utiliser une URL ou répondre à une image directement.\n\n📱 Session: {phoneNumber}",
        setephotoimage_reset: "✅ Image Ephoto360 réinitialisée!\n\nImage par défaut restaurée.\n\n📱 Session: {phoneNumber}",
        setephotoimage_upload_success: "✅ Image Ephoto360 mise à jour!\n\n**Nouvelle image définie avec succès!**\n\n💡 L'image sera utilisée pour le menu ephoto360.\n\n📱 Session: {phoneNumber}",
        setephotoimage_upload_error: "❌ Erreur lors du traitement de l'image\n\n{error}\n\nVeuillez réessayer ou utiliser une URL directe.",
        setephotoimage_url_success: "✅ Image Ephoto360 mise à jour!\n\n**Nouvelle URL:**\n{url}\n\n💡 L'image sera utilisée pour le menu ephoto360.\n\n📱 Session: {phoneNumber}",
        setephotoimage_url_error: "❌ Erreur lors de la configuration de l'image\n\n{error}\n\nL'URL doit commencer par http:// ou https://\nImage actuelle: {currentImage}",

        // setantilink.js
        setantilink_help: "🚫 **Configuration de la limite Antilink**\n\n**Limite actuelle:** {currentLimit} avertissements\n\n**Usage:** {prefix}setantilink <nombre>\n\n**Exemples:**\n• {prefix}setantilink 3 - 3 avertissements avant expulsion\n• {prefix}setantilink 1 - Expulsion immédiate\n• {prefix}setantilink 5 - 5 chances avant expulsion\n\n**Réinitialiser:** {prefix}setantilink reset\n\n⚠️ Minimum: 1 | Maximum: 10\n\n📱 Session: {phoneNumber}",
        setantilink_reset: "✅ Limite antilink réinitialisée!\n\nNouvelle limite: 3 avertissements\n\n📱 Session: {phoneNumber}",
        setantilink_success: "✅ Limite antilink mise à jour!\n\n**Nouvelle limite:** {limit} avertissement(s)\n\n💡 Les membres seront expulsés après {limit} lien(s) détecté(s).\n\n📱 Session: {phoneNumber}",
        setantilink_error: "Erreur lors de la configuration de la limite\n\n{error}\n\nLa limite doit être entre 1 et 10\nLimite actuelle: {currentLimit}",
    
        // Erreurs générales
        error_no_query: "Veuillez fournir un lien ou un titre de recherche.",
        error_no_results: "Aucun résultat trouvé",
        error_audio_extraction: "Erreur lors de l'extraction audio",
        error_video_not_found: "Vidéo non trouvée",
        error_download_link: "Lien de téléchargement non trouvé",
        error_media_not_found: "Média non trouvé",
        error_audio_not_found: "Audio non trouvé",
        error_template_not_found: "Template non trouvé",
        error_file_not_found: "Fichier non trouvé",
        error_repo_not_found: "Dépôt non trouvé",
        error_image_not_found: "Image non trouvée",
        error_content_not_found: "Contenu non trouvé",
        error_website_download: "Impossible de télécharger le site web",
        unknown_artist: "Inconnu",

        // Messages de statut
        downloader_searching: "🔍 Recherche en cours pour:\n{query}",
        downloader_downloading: "📥 Téléchargement en cours:\n{title}",

        // Captions des plateformes
        downloader_tiktok_caption: "*sᴜᴋᴜɴᴀ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:* {description}",
        downloader_facebook_caption: "*sᴜᴋᴜɴᴀ ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛʀᴇ:* {title}",
        downloader_instagram_caption: "*sᴜᴋᴜɴᴀ ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_twitter_caption: "*sᴜᴋᴜɴᴀ ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_youtube_caption: "*sᴜᴋᴜɴᴀ ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛʀᴇ:* {title}",
        downloader_music_caption: "*sᴜᴋᴜɴᴀ {service} ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Titre:* {title}\n👤 *Artiste:* {artist}",
        downloader_capcut_caption: "*sᴜᴋᴜɴᴀ ᴄᴀᴘᴄᴜᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Titre:* {title}\n👁️ *Vues:* {views}",
        downloader_gdrive_caption: "*sᴜᴋᴜɴᴀ ɢᴅʀɪᴠᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nom:* {name}\n📦 *Taille:* {size}",
        downloader_github_caption: "*sᴜᴋᴜɴᴀ ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Repo:* {repo}\n👤 *Owner:* {owner}\n⭐ *Stars:* {stars}\n🔀 *Forks:* {forks}",
        downloader_mediafire_caption: "*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nom:* {name}\n📦 *Taille:* {size}\n📅 *Upload:* {uploaded}",
        downloader_pinterest_caption: "*sᴜᴋᴜɴᴀ ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_savefrom_caption: "*sᴜᴋᴜɴᴀ sᴀᴠᴇғʀᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Qualité:* {quality}\n📦 *Type:* {type}",
        downloader_web2zip_caption: "*sᴜᴋᴜɴᴀ ᴡᴇʙ2ᴢɪᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Site:* {site}",
        
        antispam_label: "Antispam",
        antispam_threshold_error: "Le seuil doit être entre {min} et {max}.",
        antispam_on: "La protection anti-spam est maintenant activée !\n\n• Session: {phoneNumber}\n• Seuil: {threshold} messages en 2 secondes\n• TOUS les messages après détection seront supprimés\n• Expulsion après {threshold} avertissements",
        antispam_off: "La protection anti-spam est maintenant désactivée !\n\n• Session: {phoneNumber}",

        antidelete_examples: "*Exemples:*\n• {prefix}antidelete on\n• {prefix}antidelete off\n• {prefix}antidelete status",
        antidelete_status: "📊 *STATUT ANTIDELETE*\n\n{status}\n📱 *Session:* {phoneNumber}\n\n{description}",
        antidelete_already: "ℹ️ *Antidelete {status}*\n\nLe système antidelete est {status} pour cette session.",
        antidelete_enabled: "✅ *Antidelete activé*\n\n{description}\n\n📱 *Session:* {phoneNumber}",
        antidelete_disabled: "❌ *Antidelete désactivé*\n\n{description}\n\n📱 *Session:* {phoneNumber}",
        antidelete_enabled_desc: "🛡️ Les messages supprimés sont surveillés et sauvegardés.",
        antidelete_disabled_desc: "⚠️ Les messages supprimés ne sont pas surveillés.",
        antidelete_enabled_details: "🛡️ Les messages supprimés seront désormais surveillés et sauvegardés.\n\n📝 *Fonctionnalités:*\n• Capture automatique des messages\n• Récupération des médias supprimés\n• Anti-ViewOnce intégré\n• Stockage local temporaire",
        antidelete_disabled_details: "⚠️ Les messages supprimés ne seront plus surveillés.",

        groupsettings_reset_success: "Configuration du groupe réinitialisée !\n\n• Session: {phoneNumber}\n• Toutes les protections sont désactivées",
        groupsettings_display: `📊 *Configuration du groupe*\n\n🔗 *Antilink:* {antilink_status}\n   └ Seuil: {antilink_threshold} avertissements\n\n🚫 *Antispam:* {antispam_status}\n   └ Seuil: {antispam_threshold} avertissements\n\n@️⃣ *Antimention:* {antimention_status}\n\n🏷️ *Antitag:* {antitag_status}\n\n👋 *Bienvenue:* {welcome_status}\n\n🚪 *Au revoir:* {goodbye_status}\n\n🔧 *Session:* {phoneNumber}\n\n💡 Utilisez \`groupsettings reset\` pour tout réinitialiser`,

        already_enabled: "déjà activé",
        already_disabled: "déjà désactivé",

        media_name_required: "Veuillez donner un nom pour le stockage",
        media_already_exists: "Un média nommé '{name}' ({type}) existe déjà.",
        media_stored_success: "✅ Média '{name}' ({type}) stocké avec succès!",
        media_video_name_required: "📝 Veuillez spécifier le nom de la vidéo",
        media_video_not_found: "🚫 Aucune vidéo nommée '{name}' trouvée",
        media_video_playing: "*sᴜᴋᴜɴᴀ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ*\n\n📌 *Nom:* {name}",
        media_audio_name_required: "📝 Veuillez spécifier le nom de l'audio",
        media_audio_not_found: "🚫 Aucun audio nommé '{name}' trouvé",
        media_list: `*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ*\n\n{videos_count, select, 0 {} other {*🎬 ᴠɪᴅᴇᴏs ({videos_count})*\n{videos_list}\n\n}}{audios_count, select, 0 {} other {*🎵 ᴀᴜᴅɪᴏs ({audios_count})*\n{audios_list}\n\n}}{videos_count, select, 0 {}{audios_count, select, 0 {*📭 ᴄᴏʟʟᴇᴄᴛɪᴏɴ ᴠɪᴅᴇ*\n\n} other {}}}*ᴄᴏᴍᴍᴀɴᴅᴇs:*\n• {prefix}ᴠᴅ <ɴᴏᴍ> [-ᴄ ᴘᴏᴜʀ ᴄɪʀᴄᴜʟᴀɪʀᴇ]\n• {prefix}ᴀᴅ <ɴᴏᴍ>\n• {prefix}ᴅᴇʟ <ᴛʏᴘᴜ> <ɴᴏᴍ>`,
        media_delete_usage: "📝 Usage: .del <audio|video> <nom>",
        media_deleted_success: "✅ Media '{name}' ({type}) supprimé avec succès",
        media_not_found: "🚫 Media '{name}' non trouvé",
        sticker_error: "❌ Erreur lors de la création du sticker",
        sticker_steal_error: "❌ Erreur lors de la récupération du sticker",

        vv_no_quoted: "Vous devez répondre à un message à vue unique.",
        vv_image_revealed: "*Image à vue unique dévoilée*\n\n{caption, select, {} other {Légende: {caption}\n}}",
        vv_video_revealed: "*Vidéo à vue unique dévoilée*\n\n{caption, select, {} other {💬 Légende: {caption}\n}}",
        vv_invalid_message: "Le message quoté n'est pas un message à vue unique valide.",
        vv_generic_error: "Une erreur est survenue lors du dévoilement.",
        vv_buffer_empty: "Impossible de télécharger le média - fichier corrompu ou expiré.",
        vv_media_expired: "Le média n'est plus disponible sur les serveurs WhatsApp.",
        vv_download_failed: "Échec du téléchargement - le fichier est peut-être trop ancien.",

        myconfig_display: `⚙️ *Vos paramètres personnels*\n\n📱 *Numéro:* {phoneNumber}\n🤖 *Nom du bot:* {botName}\n📝 *Préfixe:* {prefix}\n🌐 *Langue:* {language}\n\n📅 *Créé le:* {createdAt}\n🔄 *Mis à jour:* {updatedAt}\n\n🛠️ *Commandes de configuration:*\n• {prefix}setname <nom> - Changer le nom du bot\n• {prefix}setprefix <préfixe> - Changer le préfixe\n• {prefix}setlang <fr|en> - Changer la langue\n• {prefix}myconfig - Voir ces paramètres\n\n💡 *Exemple d'utilisation:*\n{prefix}menu - Menu principal\n{prefix}ping - Test de connexion\n\n*Configuration personnalisée active!* ✨`,

        autowrite_usage: "Usage: {prefix}autowrite <on/off/status>",
        autowrite_status: "✍️ *Statut Autowrite*\n\n📱 *Session:* {phoneNumber}\n⚡ *Statut:* {status}",
        autowrite_already: "ℹ️ Autowrite {status}",
        autowrite_enabled: "✍️ Simulation d'écriture activée!\n\nLe bot simulera l'écriture automatiquement.\n\n📱 Session: {phoneNumber}",
        autowrite_disabled: "❌ Simulation d'écriture désactivée!\n\n📱 Session: {phoneNumber}",

        autoreact_usage: "Usage: {prefix}autoreact <on/off/status/emojis> [emojis]",
        autoreact_status: "🎭 *Statut Autoreact*\n\n📱 *Session:* {phoneNumber}\n⚡ *Statut:* {status}\n😊 *Émojis:* {emojis}",
        autoreact_already: "ℹ️ Autoreact {status}",
        autoreact_enabled: "🎭 Réactions automatiques activées!\n\nLe bot réagira automatiquement aux messages.\n\n😊 Émojis: {emojis}\n📱 Session: {phoneNumber}",
        autoreact_disabled: "❌ Réactions automatiques désactivées!\n\n📱 Session: {phoneNumber}",
        autoreact_emojis_required: "Veuillez spécifier des émojis",
        autoreact_emojis_updated: "✅ Émojis de réaction mis à jour!\n\nNouveaux émojis: {emojis}",

        autostatus_usage: "Usage: {prefix}autostatus <view/react/status> <on/off> [emoji]",
        autostatus_status: "👁️ *Statut Autostatus*\n\n📱 *Session:* {phoneNumber}\n👁️ *Visionnage:* {viewStatus}\n❤️ *Réactions:* {reactStatus}\n😊 *Émoji:* {reactEmoji}",
        autostatus_view_usage: "Usage: {prefix}autostatus view <on/off>",
        autostatus_react_usage: "Usage: {prefix}autostatus react <on/off/emoji> [emoji]",
        autostatus_emoji_required: "Veuillez spécifier un émoji",
        autostatus_view_enabled: "👁️ Visionnage automatique des status activé!\n\nLe bot verra automatiquement tous les status.\n\n📱 Session: {phoneNumber}",
        autostatus_view_disabled: "❌ Visionnage automatique des status désactivé!\n\n📱 Session: {phoneNumber}",
        autostatus_react_enabled: "❤️ Réactions automatiques aux status activées!\n\nLe bot réagira automatiquement aux status.\n\n😊 Émoji: {emoji}\n📱 Session: {phoneNumber}",
        autostatus_react_disabled: "❌ Réactions automatiques aux status désactivées!\n\n📱 Session: {phoneNumber}",
        autostatus_emoji_updated: "✅ Émoji de réaction mis à jour!\n\nNouvel émoji: {emoji}",

        save_no_quoted: "Vous devez répondre à un status pour le sauvegarder.",
        save_downloading: "⏳ Téléchargement du status en cours...",
        save_unsupported: "❌ Type de status non supporté",
        save_success: "💾 Status sauvegardé avec succès!\n\n📁 Type: {type}\n📝 Fichier: {fileName}",
        save_error: "❌ Erreur lors de la sauvegarde du status\n\n{error}",

        url_no_image: "Vous devez répondre à une image pour la convertir en URL.",
        url_uploading: "⏳ Conversion de l'image en URL...",
        url_success: "🔗 Image convertie en URL!\n\n📎 Lien: {url}",
        url_error: "❌ Erreur lors de la conversion\n\n{error}",

        setlang_help: `🌐 Configuration de la langue\n\nLangue actuelle: {currentLang}\n\nUsage: {prefix}setlang <fr/en/es/ht/id>\n\nExemples:\n• {prefix}setlang fr - Français\n• {prefix}setlang en - English\n• {prefix}setlang es - Español\n• {prefix}setlang ht - Kreyòl Ayisyen\n• {prefix}setlang id - Bahasa Indonesia\n\n📱 Note: Cette langue s'applique à toutes les réponses du bot pour votre session`,
        setlang_success: "✅ Langue mise à jour avec succès!\n\nNouvelle langue: {langName}\nSession: {phoneNumber}\n\nToutes les réponses du bot seront maintenant dans la langue sélectionnée! 🎉",
        setlang_error: "❌ Erreur lors de la configuration de la langue\n\n{error}\n\nLangues supportées: fr, en, es, ht, id\nLangue actuelle: {currentLang}",
    antidelete_detected: `🗑️ **MESSAGE SUPPRIMÉ DÉTECTÉ**\n\n🚫 **Supprimé par:** @{deletedByName}\n👤 **Expéditeur:** @{senderName}\n📱 **Numéro:** {sender}\n🕒 **Heure:** {time}\n📱 **Session:** {phoneNumber}\n👥 **Groupe:** {groupName}\n\n💬 **Message supprimé:**\n{content}`,
        
        media_or_special_message: '[Média ou message spécial]',
        
        deleted_media_recovered: `📎 **{mediaType} SUPPRIMÉ RÉCUPÉRÉ**\nExpéditeur: @{senderName}\nSession: {phoneNumber}`,
        
        media_send_error: `⚠️ Erreur envoi média: {error}`,
        
        unknown_group: 'Groupe inconnu',
        antiviewonce_detected: `🔍 *Anti-ViewOnce {mediaType}*\nExpéditeur: @{senderName}\nSession: {phoneNumber}`,
        
        // 🗑️ Anti-Delete
        antidelete_detected: `🗑️ **MESSAGE SUPPRIMÉ DÉTECTÉ**\n\n🚫 **Supprimé par:** @{deletedByName}\n👤 **Expéditeur:** @{senderName}\n📱 **Numéro:** {sender}\n🕒 **Heure:** {time}\n📱 **Session:** {phoneNumber}\n👥 **Groupe:** {groupName}\n\n💬 **Message supprimé:**\n{content}`,
        media_or_special_message: '[Média ou message spécial]',
        deleted_media_recovered: `📎 **{mediaType} SUPPRIMÉ RÉCUPÉRÉ**\nExpéditeur: @{senderName}\nSession: {phoneNumber}`,
        media_send_error: `⚠️ Erreur envoi média: {error}`,
        unknown_group: 'Groupe inconnu',
        
        // 🌟 Welcome/Bienvenue
        welcome_online: `🎉 *𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗 est maintenant en ligne!*\n\n*Session:* {phoneNumber}\n*Préfixe:* \`{prefix}\`\n\n*Tapez* \`{prefix}menu\` *pour commencer!*\n\nmade by stephdev`,
        
        // 👋 Welcome/Goodbye Group
        welcome_default: `👋 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐮𝐞 @{user} !\n\n🎉 Bienvenue dans {group}\n\n📊 Membres: {members}\n📝 Description: {desc}\n\n_Profitez bien de votre séjour !_`,
        goodbye_default: `👋 𝐀𝐮 𝐫𝐞𝐯𝐨𝐢𝐫 @{user}\n\n😢 Un membre a quitté {group}\n\n📊 Membres restants: {members}\n\n_Nous espérons vous revoir bientôt !_`,
        no_description: 'Aucune description',
        
        // 🛡️ Protections de groupe
        spam_detected: `🚨 SPAM DÉTECTÉ ! Tous les messages supprimés.\n@{senderPhone} - Avertissement {currentWarnings}/{maxWarnings}`,
        user_kicked_spam: `🚫 @{senderPhone} expulsé pour spam répétitif.`,
        
        link_detected: `🚫 Lien détecté de @{senderPhone}. Avertissement {currentWarnings}/{maxWarnings}.`,
        user_kicked_links: `🚫 @{senderPhone} expulsé pour liens répétitifs.`,
        
        mass_tag_detected: `🚫 Tag en masse détecté ({reason}) par @{senderPhone}. Message supprimé.`,
        
        group_mention_detected: `🚫 Mention du groupe interdite par @{senderPhone}.`,
        
        // ❌ Erreurs commandes
        unknown_command: `❌ *Commande inconnue: \`{command}\`*\n\nTapez *{prefix}menu* pour voir toutes les commandes disponibles!\n\n_{botName} - Session {phoneNumber}_`,
        
        command_error: `⚠️ *Erreur lors de l'exécution de la commande*\n\n*Commande:* \`{command}\`\n*Erreur:* {error}`,
        
        // 📱 Autres
        none: 'Aucune',
        private_chat: 'Discussion privée', 
    link_initializing: '⏳ Initialisation de la session pour {number}...',
link_connected: '✅ Numéro {number} connecté avec succès à {time}',
link_disconnected: '📵 Numéro {number} déconnecté. Raison: {reason}',
link_error: '❌ Erreur avec {number}: {error}',
link_pairing_code: '🔑 Code de pairage pour {number}: {code}',
number_label: 'Numéro',
pairing_code_label: 'Code de pairage',
code_valid_60s: 'Votre code est valide pour 60 secondes',
error_already_connected: '⚠️ Le numéro {number} est déjà connecté',
error_owner_only: '❌ Cette commande est réservée au propriétaire du bot',
dellink_disconnecting: '⏳ Déconnexion de {number} en cours...',
dellink_deleting_inactive: '🗑️ Suppression de la session inactive {number}...',
dellink_success: '✅ Session {number} déconnectée avec succès',
dellink_deleted: '✅ Session {number} supprimée avec succès',

    },
    
    en: {
        // Error messages
        error_group_only: "This command can only be used in groups.",
        error_admin_only: "You must be an admin to use this command.",
        error_owner_only: "This command is reserved for the bot owner.",
        error_invalid_usage: "Invalid usage. Use",
        error_not_found: "Not found",
        error_occurred: "An error occurred",
        
        // Success messages
        success_activated: "successfully activated",
        success_deactivated: "successfully deactivated",
        success_updated: "successfully updated",
        success_reset: "successfully reset",
        
        // Welcome/Goodbye
        welcome_default: "👋 𝐖𝐞𝐥𝐜𝐨𝐦𝐞",
        welcome_in_group: "Welcome to",
        goodbye_default: "👋 𝐆𝐨𝐨𝐝𝐛𝐲𝐞",
        goodbye_left_group: "A member left",
        members: "Members",
        description: "Description",
        no_description: "No description",
        enjoy_stay: "Enjoy your stay!",
        hope_see_again: "We hope to see you again soon!",
        
        // Warnings
        warnings_title: "Warnings for",
        warnings_group_title: "Group warnings",
        warnings_reset: "Warnings reset for",
        warnings_reset_all: "All warnings have been reset",
        warnings_none: "No warnings in this group",
        antilink_label: "Antilink",
        antispam_label: "Antispam",
        
        // Configuration
        config_prefix: "Prefix",
        config_botname: "Bot name",
        config_language: "Language",
        config_current: "Current configuration",
        config_updated: "Configuration updated",
        config_usage: "Usage",
        config_example: "Example",
        
        // Antilink
        antilink_enabled: "Anti-link protection is now enabled",
        antilink_disabled: "Anti-link protection is now disabled",
        antilink_detected: "Link detected from",
        antilink_warning: "Warning",
        antilink_kicked: "kicked for repeated links",
        
        // Antispam
        antispam_detected: "SPAM DETECTED! All messages deleted",
        antispam_kicked: "kicked for repeated spam",
        
        // Protection
        protection_status: "Status of",
        protection_enabled: "enabled ✅",
        protection_disabled: "disabled ❌",
        
        // Divers
        session: "Session",
        status: "Status",
        total: "Total",
        user: "user",
        users: "users",
        remaining_days: "Remaining days",

        group_link_text: "🔗 Here is the invitation to join our territory:\n\n{link}",
        lock_feature: "Group lock", 
        unlock_feature: "Group unlock",
        members_kicked: "{count} members kicked",
        members_to_kick: "members to kick",
        user_added: "User added",
        member_kicked: "Member kicked",
        member_promoted: "Member promoted to admin",
        member_demoted: "Member demoted", 
        welcome_feature: "Welcome",
        goodbye_feature: "Goodbye",

        tagall_message: "ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ!",
        alive_status: "sukuna ᴏɴʟɪɴᴇ ꜰᴏʀ {hours}ʜ{minutes}ᴍ",
        antilink_enabled: "Anti-link protection is now enabled!\n\n• Session: {phoneNumber}\n• Users will be kicked after {threshold} warnings",
        antilink_disabled: "Anti-link protection is now disabled!\n\n• Session: {phoneNumber}",
        antimention_enabled: "Anti-mention protection is now enabled!\n\n• Session: {phoneNumber}\n• Blocks all group mentions\n• Messages with mentions will be deleted",
        antimention_disabled: "Anti-mention protection is now disabled!\n\n• Session: {phoneNumber}",

        error_owner_only: "This command can only be used in private by the bot owner.",
        upload_in_progress: "⏳ Image upload in progress...",
        upload_failed: "Image upload failed",

        setmenuimage_help: "🖼️ **Menu Image Configuration**\n\n**Current Image:**\n{currentImage}\n\n**Usage:**\n• {prefix}setmenuimage <url>\n• Reply to an image with {prefix}setmenuimage\n\n**Example:**\n{prefix}setmenuimage https://i.postimg.cc/image.jpg\n\n**Reset:** {prefix}setmenuimage reset\n\n💡 You can use a URL or reply to an image directly.\n\n📱 Session: {phoneNumber}",
        setmenuimage_reset: "✅ Menu image reset!\n\nDefault image restored.\n\n📱 Session: {phoneNumber}",
        setmenuimage_upload_success: "✅ Menu image updated!\n\n**New image set successfully!**\n\n💡 The image will be used for the menu command.\n\n📱 Session: {phoneNumber}",
        setmenuimage_upload_error: "❌ Error processing image\n\n{error}\n\nPlease try again or use a direct URL.",
        setmenuimage_url_success: "✅ Menu image updated!\n\n**New URL:**\n{url}\n\n💡 The image will be used for the menu command.\n\n📱 Session: {phoneNumber}",
        setmenuimage_url_error: "❌ Error configuring image\n\n{error}\n\nURL must start with http:// or https://\nCurrent image: {currentImage}",

        setephotoimage_help: "🎨 **Ephoto360 Image Configuration**\n\n**Current Image:**\n{currentImage}\n\n**Usage:**\n• {prefix}setephotoimage <url>\n• Reply to an image with {prefix}setephotoimage\n\n**Example:**\n{prefix}setephotoimage https://i.postimg.cc/image.jpg\n\n**Reset:** {prefix}setephotoimage reset\n\n💡 You can use a URL or reply to an image directly.\n\n📱 Session: {phoneNumber}",
        setephotoimage_reset: "✅ Ephoto360 image reset!\n\nDefault image restored.\n\n📱 Session: {phoneNumber}",
        setephotoimage_upload_success: "✅ Ephoto360 image updated!\n\n**New image set successfully!**\n\n💡 The image will be used for the ephoto360 menu.\n\n📱 Session: {phoneNumber}",
        setephotoimage_upload_error: "❌ Error processing image\n\n{error}\n\nPlease try again or use a direct URL.",
        setephotoimage_url_success: "✅ Ephoto360 image updated!\n\n**New URL:**\n{url}\n\n💡 The image will be used for the ephoto360 menu.\n\n📱 Session: {phoneNumber}",
        setephotoimage_url_error: "❌ Error configuring image\n\n{error}\n\nURL must start with http:// or https://\nCurrent image: {currentImage}",

        setantilink_help: "🚫 **Antilink Limit Configuration**\n\n**Current Limit:** {currentLimit} warnings\n\n**Usage:** {prefix}setantilink <number>\n\n**Examples:**\n• {prefix}setantilink 3 - 3 warnings before kick\n• {prefix}setantilink 1 - Immediate kick\n• {prefix}setantilink 5 - 5 chances before kick\n\n**Reset:** {prefix}setantilink reset\n\n⚠️ Minimum: 1 | Maximum: 10\n\n📱 Session: {phoneNumber}",
        setantilink_reset: "✅ Antilink limit reset!\n\nNew limit: 3 warnings\n\n📱 Session: {phoneNumber}",
        setantilink_success: "✅ Antilink limit updated!\n\n**New Limit:** {limit} warning(s)\n\n💡 Members will be kicked after {limit} detected link(s).\n\n📱 Session: {phoneNumber}",
        setantilink_error: "Error configuring limit\n\n{error}\n\nLimit must be between 1 and 10\nCurrent limit: {currentLimit}",

        error_no_query: "Please provide a link or search title.",
        error_no_results: "No results found",
        error_audio_extraction: "Error extracting audio",
        error_video_not_found: "Video not found",
        error_download_link: "Download link not found",
        error_media_not_found: "Media not found",
        error_audio_not_found: "Audio not found",
        error_template_not_found: "Template not found",
        error_file_not_found: "File not found",
        error_repo_not_found: "Repository not found",
        error_image_not_found: "Image not found",
        error_content_not_found: "Content not found",
        error_website_download: "Unable to download website",
        unknown_artist: "Unknown",

        downloader_searching: "🔍 Searching for:\n{query}",
        downloader_downloading: "📥 Downloading:\n{title}",

        downloader_tiktok_caption: "*sᴜᴋᴜɴᴀ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:* {description}",
        downloader_facebook_caption: "*sᴜᴋᴜɴᴀ ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛʟᴇ:* {title}",
        downloader_instagram_caption: "*sᴜᴋᴜɴᴀ ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_twitter_caption: "*sᴜᴋᴜɴᴀ ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_youtube_caption: "*sᴜᴋᴜɴᴀ ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛʟᴇ:* {title}",
        downloader_music_caption: "*sᴜᴋᴜɴᴀ {service} ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Title:* {title}\n👤 *Artist:* {artist}",
        downloader_capcut_caption: "*sᴜᴋᴜɴᴀ ᴄᴀᴘᴄᴜᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Title:* {title}\n👁️ *Views:* {views}",
        downloader_gdrive_caption: "*sᴜᴋᴜɴᴀ ɢᴅʀɪᴠᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Name:* {name}\n📦 *Size:* {size}",
        downloader_github_caption: "*sᴜᴋᴜɴᴀ ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Repo:* {repo}\n👤 *Owner:* {owner}\n⭐ *Stars:* {stars}\n🔀 *Forks:* {forks}",
        downloader_mediafire_caption: "*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Name:* {name}\n📦 *Size:* {size}\n📅 *Upload:* {uploaded}",
        downloader_pinterest_caption: "*sᴜᴋᴜɴᴀ ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_savefrom_caption: "*sᴜᴋᴜɴᴀ sᴀᴠᴇғʀᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Quality:* {quality}\n📦 *Type:* {type}",
        downloader_web2zip_caption: "*sᴜᴋᴜɴᴀ ᴡᴇʙ2ᴢɪᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Site:* {site}",

        antispam_threshold_error: "Threshold must be between {min} and {max}.",
        antispam_on: "Anti-spam protection is now enabled!\n\n• Session: {phoneNumber}\n• Threshold: {threshold} messages in 2 seconds\n• ALL messages after detection will be deleted\n• Kick after {threshold} warnings",
        antispam_off: "Anti-spam protection is now disabled!\n\n• Session: {phoneNumber}",

        antidelete_examples: "*Examples:*\n• {prefix}antidelete on\n• {prefix}antidelete off\n• {prefix}antidelete status",
        antidelete_status: "📊 *ANTIDELETE STATUS*\n\n{status}\n📱 *Session:* {phoneNumber}\n\n{description}",
        antidelete_already: "ℹ️ *Antidelete {status}*\n\nAntidelete system is {status} for this session.",
        antidelete_enabled: "✅ *Antidelete enabled*\n\n{description}\n\n📱 *Session:* {phoneNumber}",
        antidelete_disabled: "❌ *Antidelete disabled*\n\n{description}\n\n📱 *Session:* {phoneNumber}",
        antidelete_enabled_desc: "🛡️ Deleted messages are monitored and backed up.",
        antidelete_disabled_desc: "⚠️ Deleted messages are not monitored.",
        antidelete_enabled_details: "🛡️ Deleted messages will now be monitored and backed up.\n\n📝 *Features:*\n• Automatic message capture\n• Recovery of deleted media\n• Integrated Anti-ViewOnce\n• Temporary local storage",
        antidelete_disabled_details: "⚠️ Deleted messages will no longer be monitored.",

        groupsettings_reset_success: "Group configuration reset!\n\n• Session: {phoneNumber}\n• All protections are disabled",
        groupsettings_display: `📊 *Group Configuration*\n\n🔗 *Antilink:* {antilink_status}\n   └ Threshold: {antilink_threshold} warnings\n\n🚫 *Antispam:* {antispam_status}\n   └ Threshold: {antispam_threshold} warnings\n\n@️⃣ *Antimention:* {antimention_status}\n\n🏷️ *Antitag:* {antitag_status}\n\n👋 *Welcome:* {welcome_status}\n\n🚪 *Goodbye:* {goodbye_status}\n\n🔧 *Session:* {phoneNumber}\n\n💡 Use \`groupsettings reset\` to reset everything`,

        already_enabled: "already enabled",
        already_disabled: "already disabled",

        media_name_required: "Please provide a name for storage",
        media_already_exists: "A media named '{name}' ({type}) already exists.",
        media_stored_success: "✅ Media '{name}' ({type}) stored successfully!",
        media_video_name_required: "📝 Please specify the video name",
        media_video_not_found: "🚫 No video named '{name}' found",
        media_video_playing: "*sᴜᴋᴜɴᴀ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ*\n\n📌 *Name:* {name}",
        media_audio_name_required: "📝 Please specify the audio name",
        media_audio_not_found: "🚫 No audio named '{name}' found",
        media_list: `*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀ ᴄᴏʟʟᴇᴄᴛɪᴏɴ*\n\n{videos_count, select, 0 {} other {*🎬 ᴠɪᴅᴇᴏs ({videos_count})*\n{videos_list}\n\n}}{audios_count, select, 0 {} other {*🎵 ᴀᴜᴅɪᴏs ({audios_count})*\n{audios_list}\n\n}}{videos_count, select, 0 {}{audios_count, select, 0 {*📭 ᴇᴍᴘᴛʏ ᴄᴏʟʟᴇᴄᴛɪᴏɴ*\n\n} other {}}}*ᴄᴏᴍᴍᴀɴᴅs:*\n• {prefix}ᴠᴅ <ɴᴀᴍᴇ> [-ᴄ ғᴏʀ ᴄɪʀᴄᴜʟᴀʀ]\n• {prefix}ᴀᴅ <ɴᴀᴍᴇ>\n• {prefix}ᴅᴇʟ <ᴛʏᴘᴇ> <ɴᴀᴍᴇ>`,
        media_delete_usage: "📝 Usage: .del <audio|video> <name>",
        media_deleted_success: "✅ Media '{name}' ({type}) deleted successfully",
        media_not_found: "🚫 Media '{name}' not found",
        sticker_error: "❌ Error creating sticker",
        sticker_steal_error: "❌ Error retrieving sticker",

        vv_no_quoted: "You must reply to a view-once message.",
        vv_image_revealed: "*View-once image revealed*\n\n{caption, select, {} other {Caption: {caption}\n}}",
        vv_video_revealed: "*View-once video revealed*\n\n{caption, select, {} other {💬 Caption: {caption}\n}}",
        vv_invalid_message: "The quoted message is not a valid view-once message.",
        vv_generic_error: "An error occurred while revealing.",
        vv_buffer_empty: "Unable to download media - file corrupted or expired.",
        vv_media_expired: "Media is no longer available on WhatsApp servers.",
        vv_download_failed: "Download failed - file may be too old.",

        myconfig_display: `⚙️ *Your Personal Settings*\n\n📱 *Number:* {phoneNumber}\n🤖 *Bot Name:* {botName}\n📝 *Prefix:* {prefix}\n🌐 *Language:* {language}\n\n📅 *Created:* {createdAt}\n🔄 *Updated:* {updatedAt}\n\n🛠️ *Configuration Commands:*\n• {prefix}setname <name> - Change bot name\n• {prefix}setprefix <prefix> - Change prefix\n• {prefix}setlang <fr|en> - Change language\n• {prefix}myconfig - View these settings\n\n💡 *Usage Example:*\n{prefix}menu - Main menu\n{prefix}ping - Connection test\n\n*Custom configuration active!* ✨`,

        autowrite_usage: "Usage: {prefix}autowrite <on/off/status>",
        autowrite_status: "✍️ *Autowrite Status*\n\n📱 *Session:* {phoneNumber}\n⚡ *Status:* {status}",
        autowrite_already: "ℹ️ Autowrite {status}",
        autowrite_enabled: "✍️ Writing simulation activated!\n\nThe bot will automatically simulate typing.\n\n📱 Session: {phoneNumber}",
        autowrite_disabled: "❌ Writing simulation disabled!\n\n📱 Session: {phoneNumber}",

        autoreact_usage: "Usage: {prefix}autoreact <on/off/status/emojis> [emojis]",
        autoreact_status: "🎭 *Autoreact Status*\n\n📱 *Session:* {phoneNumber}\n⚡ *Status:* {status}\n😊 *Emojis:* {emojis}",
        autoreact_already: "ℹ️ Autoreact {status}",
        autoreact_enabled: "🎭 Automatic reactions activated!\n\nThe bot will automatically react to messages.\n\n😊 Emojis: {emojis}\n📱 Session: {phoneNumber}",
        autoreact_disabled: "❌ Automatic reactions disabled!\n\n📱 Session: {phoneNumber}",
        autoreact_emojis_required: "Please specify emojis",
        autoreact_emojis_updated: "✅ Reaction emojis updated!\n\nNew emojis: {emojis}",

        autostatus_usage: "Usage: {prefix}autostatus <view/react/status> <on/off> [emoji]",
        autostatus_status: "👁️ *Autostatus Status*\n\n📱 *Session:* {phoneNumber}\n👁️ *Viewing:* {viewStatus}\n❤️ *Reactions:* {reactStatus}\n😊 *Emoji:* {reactEmoji}",
        autostatus_view_usage: "Usage: {prefix}autostatus view <on/off>",
        autostatus_react_usage: "Usage: {prefix}autostatus react <on/off/emoji> [emoji]",
        autostatus_emoji_required: "Please specify an emoji",
        autostatus_view_enabled: "👁️ Automatic status viewing activated!\n\nThe bot will automatically view all statuses.\n\n📱 Session: {phoneNumber}",
        autostatus_view_disabled: "❌ Automatic status viewing disabled!\n\n📱 Session: {phoneNumber}",
        autostatus_react_enabled: "❤️ Automatic status reactions activated!\n\nThe bot will automatically react to statuses.\n\n😊 Emoji: {emoji}\n📱 Session: {phoneNumber}",
        autostatus_react_disabled: "❌ Automatic status reactions disabled!\n\n📱 Session: {phoneNumber}",
        autostatus_emoji_updated: "✅ Reaction emoji updated!\n\nNew emoji: {emoji}",

        save_no_quoted: "You must reply to a status to save it.",
        save_downloading: "⏳ Downloading status...",
        save_unsupported: "❌ Unsupported status type",
        save_success: "💾 Status saved successfully!\n\n📁 Type: {type}\n📝 File: {fileName}",
        save_error: "❌ Error saving status\n\n{error}",

        url_no_image: "You must reply to an image to convert it to URL.",
        url_uploading: "⏳ Converting image to URL...",
        url_success: "🔗 Image converted to URL!\n\n📎 Link: {url}",
        url_error: "❌ Error during conversion\n\n{error}",

        setlang_help: `🌐 Language Configuration\n\nCurrent language: {currentLang}\n\nUsage: {prefix}setlang <fr/en/es/ht/id>\n\nExamples:\n• {prefix}setlang fr - Français\n• {prefix}setlang en - English\n• {prefix}setlang es - Español\n• {prefix}setlang ht - Kreyòl Ayisyen\n• {prefix}setlang id - Bahasa Indonesia\n\n📱 Note: This language applies to all bot responses for your session`,
        setlang_success: "✅ Language updated successfully!\n\nNew language: {langName}\nSession: {phoneNumber}\n\nAll bot responses will now be in the selected language! 🎉",
        setlang_error: "❌ Error configuring language\n\n{error}\n\nSupported languages: fr, en, es, ht, id\nCurrent language: {currentLang}",
    antidelete_detected: `🗑️ **DELETED MESSAGE DETECTED**\n\n🚫 **Deleted by:** @{deletedByName}\n👤 **Sender:** @{senderName}\n📱 **Number:** {sender}\n🕒 **Time:** {time}\n📱 **Session:** {phoneNumber}\n👥 **Group:** {groupName}\n\n💬 **Deleted message:**\n{content}`,
        
        media_or_special_message: '[Media or special message]',
        
        deleted_media_recovered: `📎 **DELETED {mediaType} RECOVERED**\nSender: @{senderName}\nSession: {phoneNumber}`,
        
        media_send_error: `⚠️ Media send error: {error}`,
        
        unknown_group: 'Unknown group',
     antiviewonce_detected: `🔍 *Anti-ViewOnce {mediaType}*\nSender: @{senderName}\nSession: {phoneNumber}`,
        
        // 🗑️ Anti-Delete
        antidelete_detected: `🗑️ **DELETED MESSAGE DETECTED**\n\n🚫 **Deleted by:** @{deletedByName}\n👤 **Sender:** @{senderName}\n📱 **Number:** {sender}\n🕒 **Time:** {time}\n📱 **Session:** {phoneNumber}\n👥 **Group:** {groupName}\n\n💬 **Deleted message:**\n{content}`,
        media_or_special_message: '[Media or special message]',
        deleted_media_recovered: `📎 **DELETED {mediaType} RECOVERED**\nSender: @{senderName}\nSession: {phoneNumber}`,
        media_send_error: `⚠️ Media send error: {error}`,
        unknown_group: 'Unknown group',
        
        // 🌟 Welcome/Bienvenue
        welcome_online: `🎉 *𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗 is now online!*\n\n*Session:* {phoneNumber}\n*Prefix:* \`{prefix}\`\n\n*Type* \`{prefix}menu\` *to get started!*\n\nmade by stephdev`,
        
        // 👋 Welcome/Goodbye Group
        welcome_default: `👋 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 @{user} !\n\n🎉 Welcome to {group}\n\n📊 Members: {members}\n📝 Description: {desc}\n\n_Enjoy your stay!_`,
        goodbye_default: `👋 𝐆𝐨𝐨𝐝𝐛𝐲𝐞 @{user}\n\n😢 A member left {group}\n\n📊 Remaining members: {members}\n\n_We hope to see you again soon!_`,
        no_description: 'No description',
        
        // 🛡️ Group Protections
        spam_detected: `🚨 SPAM DETECTED! All messages deleted.\n@{senderPhone} - Warning {currentWarnings}/{maxWarnings}`,
        user_kicked_spam: `🚫 @{senderPhone} kicked for repetitive spam.`,
        
        link_detected: `🚫 Link detected from @{senderPhone}. Warning {currentWarnings}/{maxWarnings}.`,
        user_kicked_links: `🚫 @{senderPhone} kicked for repetitive links.`,
        
        mass_tag_detected: `🚫 Mass tag detected ({reason}) by @{senderPhone}. Message deleted.`,
        
        group_mention_detected: `🚫 Group mention forbidden by @{senderPhone}.`,
        
        // ❌ Command Errors
        unknown_command: `❌ *Unknown command: \`{command}\`*\n\nType *{prefix}menu* to see all available commands!\n\n_{botName} - Session {phoneNumber}_`,
        
        command_error: `⚠️ *Error executing command*\n\n*Command:* \`{command}\`\n*Error:* {error}`,
        
        // 📱 Others
        none: 'None',
        private_chat: 'Private chat', 
        link_initializing: '⏳ Initializing session for {number}...',
link_connected: '✅ Number {number} connected successfully at {time}',
link_disconnected: '📵 Number {number} disconnected. Reason: {reason}',
link_error: '❌ Error with {number}: {error}',
link_pairing_code: '🔑 Pairing code for {number}: {code}',
number_label: 'Number',
pairing_code_label: 'Pairing code',
code_valid_60s: 'Your code is valid for 60 seconds',
error_already_connected: '⚠️ Number {number} is already connected',
error_owner_only: '❌ This command is reserved for the bot owner',
dellink_disconnecting: '⏳ Disconnecting {number}...',
dellink_deleting_inactive: '🗑️ Deleting inactive session {number}...',
dellink_success: '✅ Session {number} disconnected successfully',
dellink_deleted: '✅ Session {number} deleted successfully',

    },
    
    es: {
        // Mensajes de error
        error_group_only: "Este comando solo puede usarse en grupos.",
        error_admin_only: "Debes ser administrador para usar este comando.",
        error_owner_only: "Este comando está reservado para el propietario del bot.",
        error_invalid_usage: "Uso inválido. Usa",
        error_not_found: "No encontrado",
        error_occurred: "Ocurrió un error",
        
        // Mensajes de éxito
        success_activated: "activado exitosamente",
        success_deactivated: "desactivado exitosamente",
        success_updated: "actualizado exitosamente",
        success_reset: "reiniciado exitosamente",
        
        // Bienvenida/Despedida
        welcome_default: "👋 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨",
        welcome_in_group: "Bienvenido a",
        goodbye_default: "👋 𝐀𝐝𝐢ó𝐬",
        goodbye_left_group: "Un miembro se fue",
        members: "Miembros",
        description: "Descripción",
        no_description: "Sin descripción",
        enjoy_stay: "¡Disfruta tu estadía!",
        hope_see_again: "¡Esperamos verte de nuevo pronto!",
        
        // Advertencias
        warnings_title: "Advertencias para",
        warnings_group_title: "Advertencias del grupo",
        warnings_reset: "Advertencias reiniciadas para",
        warnings_reset_all: "Todas las advertencias han sido reiniciadas",
        warnings_none: "No hay advertencias en este grupo",
        antilink_label: "Antienlace",
        antispam_label: "Antispam",
        
        // Configuración
        config_prefix: "Prefijo",
        config_botname: "Nombre del bot",
        config_language: "Idioma",
        config_current: "Configuración actual",
        config_updated: "Configuración actualizada",
        config_usage: "Uso",
        config_example: "Ejemplo",
        
        // Antienlace
        antilink_enabled: "La protección anti-enlaces ahora está activada",
        antilink_disabled: "La protección anti-enlaces ahora está desactivada",
        antilink_detected: "Enlace detectado de",
        antilink_warning: "Advertencia",
        antilink_kicked: "expulsado por enlaces repetidos",
        
        // Antispam
        antispam_detected: "¡SPAM DETECTADO! Todos los mensajes eliminados",
        antispam_kicked: "expulsado por spam repetitivo",
        
        // Protección
        protection_status: "Estado de",
        protection_enabled: "activado ✅",
        protection_disabled: "desactivado ❌",
        
        // Varios
        session: "Sesión",
        status: "Estado",
        total: "Total",
        user: "usuario",
        users: "usuarios",
        remaining_days: "Días restantes",

        group_link_text: "🔗 Aquí está la invitación para unirse a nuestro territorio:\n\n{link}",
        lock_feature: "Bloqueo de grupo",
        unlock_feature: "Desbloqueo de grupo",
        members_kicked: "{count} miembros expulsados",
        members_to_kick: "miembros a expulsar",
        user_added: "Usuario agregado",
        member_kicked: "Miembro expulsado",
        member_promoted: "Miembro promovido a admin",
        member_demoted: "Miembro degradado",
        welcome_feature: "Bienvenida",
        goodbye_feature: "Despedida",

        tagall_message: "ᴀᴛᴇɴᴄɪóɴ ᴀ ᴛᴏᴅᴏs!",
        alive_status: "sukuna ᴇɴ ʟíɴᴇᴀ ᴅᴇsᴅᴇ ʜᴀᴄᴇ {hours}ʜ{minutes}ᴍ",
        antilink_enabled: "¡La protección anti-enlaces ahora está activada!\n\n• Sesión: {phoneNumber}\n• Los usuarios serán expulsados después de {threshold} advertencias",
        antilink_disabled: "¡La protección anti-enlaces ahora está desactivada!\n\n• Sesión: {phoneNumber}",
        antimention_enabled: "¡La protección anti-menciones ahora está activada!\n\n• Sesión: {phoneNumber}\n• Bloquea todas las menciones del grupo\n• Los mensajes con menciones serán eliminados",
        antimention_disabled: "¡La protección anti-menciones ahora está desactivada!\n\n• Sesión: {phoneNumber}",

        error_owner_only: "Este comando solo puede usarse en privado por el propietario del bot.",
        upload_in_progress: "⏳ Subida de imagen en progreso...",
        upload_failed: "Error al subir imagen",

        setmenuimage_help: "🖼️ **Configuración de imagen del menú**\n\n**Imagen actual:**\n{currentImage}\n\n**Uso:**\n• {prefix}setmenuimage <url>\n• Responder a una imagen con {prefix}setmenuimage\n\n**Ejemplo:**\n{prefix}setmenuimage https://i.postimg.cc/image.jpg\n\n**Reiniciar:** {prefix}setmenuimage reset\n\n💡 Puedes usar una URL o responder a una imagen directamente.\n\n📱 Sesión: {phoneNumber}",
        setmenuimage_reset: "¡✅ Imagen del menú reiniciada!\n\nImagen por defecto restaurada.\n\n📱 Sesión: {phoneNumber}",
        setmenuimage_upload_success: "¡✅ Imagen del menú actualizada!\n\n**¡Nueva imagen establecida con éxito!**\n\n💡 La imagen se usará para el comando menú.\n\n📱 Sesión: {phoneNumber}",
        setmenuimage_upload_error: "❌ Error procesando imagen\n\n{error}\n\nPor favor intenta de nuevo o usa una URL directa.",
        setmenuimage_url_success: "¡✅ Imagen del menú actualizada!\n\n**Nueva URL:**\n{url}\n\n💡 La imagen se usará para el comando menú.\n\n📱 Sesión: {phoneNumber}",
        setmenuimage_url_error: "❌ Error configurando imagen\n\n{error}\n\nLa URL debe comenzar con http:// o https://\nImagen actual: {currentImage}",

        setephotoimage_help: "🎨 **Configuración de imagen Ephoto360**\n\n**Imagen actual:**\n{currentImage}\n\n**Uso:**\n• {prefix}setephotoimage <url>\n• Responder a una imagen con {prefix}setephotoimage\n\n**Ejemplo:**\n{prefix}setephotoimage https://i.postimg.cc/image.jpg\n\n**Reiniciar:** {prefix}setephotoimage reset\n\n💡 Puedes usar una URL o responder a una imagen directamente.\n\n📱 Sesión: {phoneNumber}",
        setephotoimage_reset: "¡✅ Imagen Ephoto360 reiniciada!\n\nImagen por defecto restaurada.\n\n📱 Sesión: {phoneNumber}",
        setephotoimage_upload_success: "¡✅ Imagen Ephoto360 actualizada!\n\n**¡Nueva imagen establecida con éxito!**\n\n💡 La imagen se usará para el menú ephoto360.\n\n📱 Sesión: {phoneNumber}",
        setephotoimage_upload_error: "❌ Error procesando imagen\n\n{error}\n\nPor favor intenta de nuevo o usa una URL directa.",
        setephotoimage_url_success: "¡✅ Imagen Ephoto360 actualizada!\n\n**Nueva URL:**\n{url}\n\n💡 La imagen se usará para el menú ephoto360.\n\n📱 Sesión: {phoneNumber}",
        setephotoimage_url_error: "❌ Error configurando imagen\n\n{error}\n\nLa URL debe comenzar con http:// o https://\nImagen actual: {currentImage}",

        setantilink_help: "🚫 **Configuración del límite Antienlace**\n\n**Límite actual:** {currentLimit} advertencias\n\n**Uso:** {prefix}setantilink <número>\n\n**Ejemplos:**\n• {prefix}setantilink 3 - 3 advertencias antes de expulsar\n• {prefix}setantilink 1 - Expulsión inmediata\n• {prefix}setantilink 5 - 5 oportunidades antes de expulsar\n\n**Reiniciar:** {prefix}setantilink reset\n\n⚠️ Mínimo: 1 | Máximo: 10\n\n📱 Sesión: {phoneNumber}",
        setantilink_reset: "¡✅ Límite antienlace reiniciado!\n\nNuevo límite: 3 advertencias\n\n📱 Sesión: {phoneNumber}",
        setantilink_success: "¡✅ Límite antienlace actualizado!\n\n**Nuevo límite:** {limit} advertencia(s)\n\n💡 Los miembros serán expulsados después de {limit} enlace(s) detectado(s).\n\n📱 Sesión: {phoneNumber}",
        setantilink_error: "Error configurando límite\n\n{error}\n\nEl límite debe estar entre 1 y 10\nLímite actual: {currentLimit}",

        error_no_query: "Por favor proporciona un enlace o título de búsqueda.",
        error_no_results: "No se encontraron resultados",
        error_audio_extraction: "Error extrayendo audio",
        error_video_not_found: "Video no encontrado",
        error_download_link: "Enlace de descarga no encontrado",
        error_media_not_found: "Medio no encontrado",
        error_audio_not_found: "Audio no encontrado",
        error_template_not_found: "Plantilla no encontrada",
        error_file_not_found: "Archivo no encontrado",
        error_repo_not_found: "Repositorio no encontrado",
        error_image_not_found: "Imagen no encontrada",
        error_content_not_found: "Contenido no encontrado",
        error_website_download: "No se pudo descargar el sitio web",
        unknown_artist: "Desconocido",

        downloader_searching: "🔍 Buscando:\n{query}",
        downloader_downloading: "📥 Descargando:\n{title}",

        downloader_tiktok_caption: "*sᴜᴋᴜɴᴀ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴅᴇsᴄʀɪᴘᴄɪóɴ:* {description}",
        downloader_facebook_caption: "*sᴜᴋᴜɴᴀ ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛíᴛᴜʟᴏ:* {title}",
        downloader_instagram_caption: "*sᴜᴋᴜɴᴀ ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_twitter_caption: "*sᴜᴋᴜɴᴀ ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_youtube_caption: "*sᴜᴋᴜɴᴀ ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛíᴛᴜʟᴏ:* {title}",
        downloader_music_caption: "*sᴜᴋᴜɴᴀ {service} ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Título:* {title}\n👤 *Artista:* {artist}",
        downloader_capcut_caption: "*sᴜᴋᴜɴᴀ ᴄᴀᴘᴄᴜᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Título:* {title}\n👁️ *Vistas:* {views}",
        downloader_gdrive_caption: "*sᴜᴋᴜɴᴀ ɢᴅʀɪᴠᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nombre:* {name}\n📦 *Tamaño:* {size}",
        downloader_github_caption: "*sᴜᴋᴜɴᴀ ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Repo:* {repo}\n👤 *Propietario:* {owner}\n⭐ *Estrellas:* {stars}\n🔀 *Forks:* {forks}",
        downloader_mediafire_caption: "*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nombre:* {name}\n📦 *Tamaño:* {size}\n📅 *Subido:* {uploaded}",
        downloader_pinterest_caption: "*sᴜᴋᴜɴᴀ ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_savefrom_caption: "*sᴜᴋᴜɴᴀ sᴀᴠᴇғʀᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Calidad:* {quality}\n📦 *Tipo:* {type}",
        downloader_web2zip_caption: "*sᴜᴋᴜɴᴀ ᴡᴇʙ2ᴢɪᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Sitio:* {site}",

        antispam_threshold_error: "El umbral debe estar entre {min} y {max}.",
        antispam_on: "¡La protección anti-spam ahora está activada!\n\n• Sesión: {phoneNumber}\n• Umbral: {threshold} mensajes en 2 segundos\n• TODOS los mensajes después de la detección serán eliminados\n• Expulsión después de {threshold} advertencias",
        antispam_off: "¡La protección anti-spam ahora está desactivada!\n\n• Sesión: {phoneNumber}",

        antidelete_examples: "*Ejemplos:*\n• {prefix}antidelete on\n• {prefix}antidelete off\n• {prefix}antidelete status",
        antidelete_status: "📊 *ESTADO ANTIDELETE*\n\n{status}\n📱 *Sesión:* {phoneNumber}\n\n{description}",
        antidelete_already: "ℹ️ *Antidelete {status}*\n\nEl sistema antidelete está {status} para esta sesión.",
        antidelete_enabled: "✅ *Antidelete activado*\n\n{description}\n\n📱 *Sesión:* {phoneNumber}",
        antidelete_disabled: "❌ *Antidelete desactivado*\n\n{description}\n\n📱 *Sesión:* {phoneNumber}",
        antidelete_enabled_desc: "🛡️ Los mensajes eliminados son monitoreados y respaldados.",
        antidelete_disabled_desc: "⚠️ Los mensajes eliminados no son monitoreados.",
        antidelete_enabled_details: "🛡️ Los mensajes eliminados ahora serán monitoreados y respaldados.\n\n📝 *Características:*\n• Captura automática de mensajes\n• Recuperación de medios eliminados\n• Anti-ViewOnce integrado\n• Almacenamiento local temporal",
        antidelete_disabled_details: "⚠️ Los mensajes eliminados ya no serán monitoreados.",

        groupsettings_reset_success: "¡Configuración del grupo reiniciada!\n\n• Sesión: {phoneNumber}\n• Todas las protecciones están desactivadas",
        groupsettings_display: `📊 *Configuración del grupo*\n\n🔗 *Antienlace:* {antilink_status}\n   └ Umbral: {antilink_threshold} advertencias\n\n🚫 *Antispam:* {antispam_status}\n   └ Umbral: {antispam_threshold} advertencias\n\n@️⃣ *Antimention:* {antimention_status}\n\n🏷️ *Antitag:* {antitag_status}\n\n👋 *Bienvenida:* {welcome_status}\n\n🚪 *Despedida:* {goodbye_status}\n\n🔧 *Sesión:* {phoneNumber}\n\n💡 Usa \`groupsettings reset\` para reiniciar todo`,

        already_enabled: "ya activado",
        already_disabled: "ya desactivado",

        media_name_required: "Por favor proporciona un nombre para almacenar",
        media_already_exists: "Ya existe un medio llamado '{name}' ({type}).",
        media_stored_success: "¡✅ Medio '{name}' ({type}) almacenado exitosamente!",
        media_video_name_required: "📝 Por favor especifica el nombre del video",
        media_video_not_found: "🚫 No se encontró video llamado '{name}'",
        media_video_playing: "*sᴜᴋᴜɴᴀ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ*\n\n📌 *Nombre:* {name}",
        media_audio_name_required: "📝 Por favor especifica el nombre del audio",
        media_audio_not_found: "🚫 No se encontró audio llamado '{name}'",
        media_list: `*sᴜᴋᴜɴᴀ ᴄᴏʟᴇᴄᴄɪóɴ ᴅᴇ ᴍᴇᴅɪᴏs*\n\n{videos_count, select, 0 {} other {*🎬 ᴠɪᴅᴇᴏs ({videos_count})*\n{videos_list}\n\n}}{audios_count, select, 0 {} other {*🎵 ᴀᴜᴅɪᴏs ({audios_count})*\n{audios_list}\n\n}}{videos_count, select, 0 {}{audios_count, select, 0 {*📭 ᴄᴏʟᴇᴄᴄɪóɴ ᴠᴀᴄíᴀ*\n\n} other {}}}*ᴄᴏᴍᴀɴᴅᴏs:*\n• {prefix}ᴠᴅ <ɴᴏᴍʙʀᴇ> [-ᴄ ᴘᴀʀᴀ ᴄɪʀᴄᴜʟᴀʀ]\n• {prefix}ᴀᴅ <ɴᴏᴍʙʀᴇ>\n• {prefix}ᴅᴇʟ <ᴛɪᴘᴏ> <ɴᴏᴍʙʀᴇ>`,
        media_delete_usage: "📝 Uso: .del <audio|video> <nombre>",
        media_deleted_success: "✅ Medio '{name}' ({type}) eliminado exitosamente",
        media_not_found: "🚫 Medio '{name}' no encontrado",
        sticker_error: "❌ Error creando sticker",
        sticker_steal_error: "❌ Error recuperando sticker",

        vv_no_quoted: "Debes responder a un mensaje de vista única.",
        vv_image_revealed: "*Imagen de vista única revelada*\n\n{caption, select, {} other {Leyenda: {caption}\n}}",
        vv_video_revealed: "*Video de vista única revelada*\n\n{caption, select, {} other {💬 Leyenda: {caption}\n}}",
        vv_invalid_message: "El mensaje citado no es un mensaje de vista única válido.",
        vv_generic_error: "Ocurrió un error al revelar.",
        vv_buffer_empty: "No se puede descargar el medio - archivo corrupto o expirado.",
        vv_media_expired: "El medio ya no está disponible en los servidores de WhatsApp.",
        vv_download_failed: "Error en la descarga - el archivo puede ser demasiado antiguo.",

        myconfig_display: `⚙️ *Tus configuraciones personales*\n\n📱 *Número:* {phoneNumber}\n🤖 *Nombre del bot:* {botName}\n📝 *Prefijo:* {prefix}\n🌐 *Idioma:* {language}\n\n📅 *Creado:* {createdAt}\n🔄 *Actualizado:* {updatedAt}\n\n🛠️ *Comandos de configuración:*\n• {prefix}setname <nombre> - Cambiar nombre del bot\n• {prefix}setprefix <prefijo> - Cambiar prefijo\n• {prefix}setlang <fr|en> - Cambiar idioma\n• {prefix}myconfig - Ver estas configuraciones\n\n💡 *Ejemplo de uso:*\n{prefix}menu - Menú principal\n{prefix}ping - Test de conexión\n\n*¡Configuración personalizada activa!* ✨`,

        autowrite_usage: "Uso: {prefix}autowrite <on/off/status>",
        autowrite_status: "✍️ *Estado Autowrite*\n\n📱 *Sesión:* {phoneNumber}\n⚡ *Estado:* {status}",
        autowrite_already: "ℹ️ Autowrite {status}",
        autowrite_enabled: "¡✍️ Simulación de escritura activada!\n\nEl bot simulará la escritura automáticamente.\n\n📱 Sesión: {phoneNumber}",
        autowrite_disabled: "¡❌ Simulación de escritura desactivada!\n\n📱 Sesión: {phoneNumber}",

        autoreact_usage: "Uso: {prefix}autoreact <on/off/status/emojis> [emojis]",
        autoreact_status: "🎭 *Estado Autoreact*\n\n📱 *Sesión:* {phoneNumber}\n⚡ *Estado:* {status}\n😊 *Emojis:* {emojis}",
        autoreact_already: "ℹ️ Autoreact {status}",
        autoreact_enabled: "¡🎭 Reacciones automáticas activadas!\n\nEl bot reaccionará automáticamente a los mensajes.\n\n😊 Emojis: {emojis}\n📱 Sesión: {phoneNumber}",
        autoreact_disabled: "¡❌ Reacciones automáticas desactivadas!\n\n📱 Sesión: {phoneNumber}",
        autoreact_emojis_required: "Por favor especifica emojis",
        autoreact_emojis_updated: "¡✅ Emojis de reacción actualizados!\n\nNuevos emojis: {emojis}",

        autostatus_usage: "Uso: {prefix}autostatus <view/react/status> <on/off> [emoji]",
        autostatus_status: "👁️ *Estado Autostatus*\n\n📱 *Sesión:* {phoneNumber}\n👁️ *Vista:* {viewStatus}\n❤️ *Reacciones:* {reactStatus}\n😊 *Emoji:* {reactEmoji}",
        autostatus_view_usage: "Uso: {prefix}autostatus view <on/off>",
        autostatus_react_usage: "Uso: {prefix}autostatus react <on/off/emoji> [emoji]",
        autostatus_emoji_required: "Por favor especifica un emoji",
        autostatus_view_enabled: "¡👁️ Vista automática de estados activada!\n\nEl bot verá automáticamente todos los estados.\n\n📱 Sesión: {phoneNumber}",
        autostatus_view_disabled: "¡❌ Vista automática de estados desactivada!\n\n📱 Sesión: {phoneNumber}",
        autostatus_react_enabled: "¡❤️ Reacciones automáticas a estados activadas!\n\nEl bot reaccionará automáticamente a los estados.\n\n😊 Emoji: {emoji}\n📱 Sesión: {phoneNumber}",
        autostatus_react_disabled: "¡❌ Reacciones automáticas a estados desactivadas!\n\n📱 Sesión: {phoneNumber}",
        autostatus_emoji_updated: "¡✅ Emoji de reacción actualizado!\n\nNuevo emoji: {emoji}",

        save_no_quoted: "Debes responder a un estado para guardarlo.",
        save_downloading: "⏳ Descargando estado...",
        save_unsupported: "❌ Tipo de estado no soportado",
        save_success: "💾 ¡Estado guardado exitosamente!\n\n📁 Tipo: {type}\n📝 Archivo: {fileName}",
        save_error: "❌ Error guardando estado\n\n{error}",

        url_no_image: "Debes responder a una imagen para convertirla a URL.",
        url_uploading: "⏳ Convirtiendo imagen a URL...",
        url_success: "🔗 ¡Imagen convertida a URL!\n\n📎 Enlace: {url}",
        url_error: "❌ Error durante la conversión\n\n{error}",

        setlang_help: `🌐 Configuración de idioma\n\nIdioma actual: {currentLang}\n\nUso: {prefix}setlang <fr/en/es/ht/id>\n\nEjemplos:\n• {prefix}setlang fr - Français\n• {prefix}setlang en - English\n• {prefix}setlang es - Español\n• {prefix}setlang ht - Kreyòl Ayisyen\n• {prefix}setlang id - Bahasa Indonesia\n\n📱 Nota: Este idioma aplica a todas las respuestas del bot para tu sesión`,
        setlang_success: "¡✅ Idioma actualizado exitosamente!\n\nNuevo idioma: {langName}\nSesión: {phoneNumber}\n\n¡Todas las respuestas del bot estarán ahora en el idioma seleccionado! 🎉",
        setlang_error: "❌ Error configurando idioma\n\n{error}\n\nIdiomas soportados: fr, en, es, ht, id\nIdioma actual: {currentLang}",
    
     antidelete_detected: `🗑️ **MENSAJE ELIMINADO DETECTADO**\n\n🚫 **Eliminado por:** @{deletedByName}\n👤 **Remitente:** @{senderName}\n📱 **Número:** {sender}\n🕒 **Hora:** {time}\n📱 **Sesión:** {phoneNumber}\n👥 **Grupo:** {groupName}\n\n💬 **Mensaje eliminado:**\n{content}`,
        
        media_or_special_message: '[Medio o mensaje especial]',
        
        deleted_media_recovered: `📎 **{mediaType} ELIMINADO RECUPERADO**\nRemitente: @{senderName}\nSesión: {phoneNumber}`,
        
        media_send_error: `⚠️ Error envío medio: {error}`,
        
        unknown_group: 'Grupo desconocido',

        antiviewonce_detected: `🔍 *Anti-ViewOnce {mediaType}*\nRemitente: @{senderName}\nSesión: {phoneNumber}`,
        
        // 🗑️ Anti-Delete
        antidelete_detected: `🗑️ **MENSAJE ELIMINADO DETECTADO**\n\n🚫 **Eliminado por:** @{deletedByName}\n👤 **Remitente:** @{senderName}\n📱 **Número:** {sender}\n🕒 **Hora:** {time}\n📱 **Sesión:** {phoneNumber}\n👥 **Grupo:** {groupName}\n\n💬 **Mensaje eliminado:**\n{content}`,
        media_or_special_message: '[Medio o mensaje especial]',
        deleted_media_recovered: `📎 **{mediaType} ELIMINADO RECUPERADO**\nRemitente: @{senderName}\nSesión: {phoneNumber}`,
        media_send_error: `⚠️ Error envío medio: {error}`,
        unknown_group: 'Grupo desconocido',
        
        // 🌟 Welcome/Bienvenue
        welcome_online: `🎉 *¡𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗 ahora está en línea!*\n\n*Sesión:* {phoneNumber}\n*Prefijo:* \`{prefix}\`\n\n*Escribe* \`{prefix}menu\` *para comenzar!*\n\nhecho por stephdev`,
        
        // 👋 Welcome/Goodbye Group
        welcome_default: `👋 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 @{user} !\n\n🎉 Bienvenido a {group}\n\n📊 Miembros: {members}\n📝 Descripción: {desc}\n\n_¡Disfruta de tu estadía!_`,
        goodbye_default: `👋 𝐀𝐝𝐢ó𝐬 @{user}\n\n😢 Un miembro salió de {group}\n\n📊 Miembros restantes: {members}\n\n_¡Esperamos verte de nuevo pronto!_`,
        no_description: 'Sin descripción',
        
        // 🛡️ Protecciones de grupo
        spam_detected: `🚨 ¡SPAM DETECTADO! Todos los mensajes eliminados.\n@{senderPhone} - Advertencia {currentWarnings}/{maxWarnings}`,
        user_kicked_spam: `🚫 @{senderPhone} expulsado por spam repetitivo.`,
        
        link_detected: `🚫 Enlace detectado de @{senderPhone}. Advertencia {currentWarnings}/{maxWarnings}.`,
        user_kicked_links: `🚫 @{senderPhone} expulsado por enlaces repetitivos.`,
        
        mass_tag_detected: `🚫 Etiqueta masiva detectada ({reason}) por @{senderPhone}. Mensaje eliminado.`,
        
        group_mention_detected: `🚫 Mención del grupo prohibida por @{senderPhone}.`,
        
        // ❌ Errores de comandos
        unknown_command: `❌ *Comando desconocido: \`{command}\`*\n\n¡Escribe *{prefix}menu* para ver todos los comandos disponibles!\n\n_{botName} - Sesión {phoneNumber}_`,
        
        command_error: `⚠️ *Error al ejecutar el comando*\n\n*Comando:* \`{command}\`\n*Error:* {error}`,
        
        // 📱 Otros
        none: 'Ninguno',
        private_chat: 'Chat privado', 
    link_initializing: '⏳ Inicializando sesión para {number}...',
link_connected: '✅ Número {number} conectado exitosamente a las {time}',
link_disconnected: '📵 Número {number} desconectado. Razón: {reason}',
link_error: '❌ Error con {number}: {error}',
link_pairing_code: '🔑 Código de emparejamiento para {number}: {code}',
number_label: 'Número',
pairing_code_label: 'Código de emparejamiento',
code_valid_60s: 'Tu código es válido por 60 segundos',
error_already_connected: '⚠️ El número {number} ya está conectado',
error_owner_only: '❌ Este comando está reservado para el dueño del bot',
dellink_disconnecting: '⏳ Desconectando {number}...',
dellink_deleting_inactive: '🗑️ Eliminando sesión inactiva {number}...',
dellink_success: '✅ Sesión {number} desconectada exitosamente',
dellink_deleted: '✅ Sesión {number} eliminada exitosamente',

    },
    
    ht: {
        // Mesaj erè
        error_group_only: "Kòmand sa a sèlman ka itilize nan gwoup.",
        error_admin_only: "Ou dwe yon administratè pou itilize kòmand sa a.",
        error_owner_only: "Kòmand sa a rezève pou mèt bot la.",
        error_invalid_usage: "Itilizasyon envalid. Itilize",
        error_not_found: "Pa jwenn",
        error_occurred: "Yon erè rive",
        
        // Mesaj siksè
        success_activated: "aktive avèk siksè",
        success_deactivated: "dezaktiye avèk siksè",
        success_updated: "aktyalize avèk siksè",
        success_reset: "reyajiste avèk siksè",
        
        // Akeyi / Orevwa
        welcome_default: "👋 𝐁𝐲𝐞𝐧𝐯𝐞𝐧𝐢",
        welcome_in_group: "Byenveni nan",
        goodbye_default: "👋 𝐎𝐫𝐞𝐯𝐰𝐚",
        goodbye_left_group: "Yon manm kite",
        members: "Manm",
        description: "Deskripsyon",
        no_description: "Pa gen deskripsyon",
        enjoy_stay: "Pwofite sejou w!",
        hope_see_again: "Nou espere wè w ankò talè!",
        
        // Avètisman
        warnings_title: "Avètisman pou",
        warnings_group_title: "Avètisman gwoup",
        warnings_reset: "Avètisman reyajiste pou",
        warnings_reset_all: "Tout avètisman yo te reyajiste",
        warnings_none: "Pa gen avètisman nan gwoup sa a",
        antilink_label: "Antilen",
        antispam_label: "Antispam",
        
        // Konfigirasyon
        config_prefix: "Prefiks",
        config_botname: "Non bot",
        config_language: "Lang",
        config_current: "Konfigirasyon aktyèl",
        config_updated: "Konfigirasyon aktyalize",
        config_usage: "Itilizasyon",
        config_example: "Egzanp",
        
        // Antilen
        antilink_enabled: "Pwoteksyon anti-lyen kounye a aktive",
        antilink_disabled: "Pwoteksyon anti-lyen kounye a dezaktiye",
        antilink_detected: "Lyen detekte soti nan",
        antilink_warning: "Avètisman",
        antilink_kicked: "voye deyò pou lyen repete",
        
        // Antispam
        antispam_detected: "SPAM DETEKTE! Tout mesaj efase",
        antispam_kicked: "voye deyò pou spam repete",
        
        // Pwoteksyon
        protection_status: "Estati",
        protection_enabled: "aktive ✅",
        protection_disabled: "dezaktiye ❌",
        
        // Divès
        session: "Sesyon",
        status: "Estati",
        total: "Total",
        user: "itilizatè",
        users: "itilizatè yo",
        remaining_days: "Jou ki rete",

        group_link_text: "🔗 Men envitasyon an pou rantre nan teritwa nou an:\n\n{link}",
        lock_feature: "Fèmen gwoup",
        unlock_feature: "Dekle gwoup",
        members_kicked: "{count} manm voye deyò",
        members_to_kick: "manm pou voye deyò",
        user_added: "Itilizatè ajoute",
        member_kicked: "Manm voye deyò",
        member_promoted: "Manm monte nan administratè",
        member_demoted: "Manm desann",
        welcome_feature: "Akeyi",
        goodbye_feature: "Orevwa",

        tagall_message: "ᴀᴛᴀɴsʏᴏɴ ᴛᴏᴜᴛ ᴍᴏᴜɴ!",
        alive_status: "sukuna ᴏɴʟɪɴ ᴅᴇᴘɪ {hours}ʜ{minutes}ᴍ",
        antilink_enabled: "Pwoteksyon anti-lyen kounye a aktive!\n\n• Sesyon: {phoneNumber}\n• Itilizatè yo ap voye deyò apre {threshold} avètisman",
        antilink_disabled: "Pwoteksyon anti-lyen kounye a dezaktiye!\n\n• Sesyon: {phoneNumber}",
        antimention_enabled: "Pwoteksyon anti-mansyone kounye a aktive!\n\n• Sesyon: {phoneNumber}\n• Bloke tout mansyone gwoup\n• Mesaj ki gen mansyone ap efase",
        antimention_disabled: "Pwoteksyon anti-mansyone kounye a dezaktiye!\n\n• Sesyon: {phoneNumber}",

        error_owner_only: "Kòmand sa a sèlman ka itilize an prive pa mèt bot la.",
        upload_in_progress: "⏳ Upload imaj an kou...",
        upload_failed: "Echèk upload imaj",

        setmenuimage_help: "🖼️ **Konfigirasyon Imaj Menu**\n\n**Imaj Aktyèl:**\n{currentImage}\n\n**Itilizasyon:**\n• {prefix}setmenuimage <url>\n• Reponn a yon imaj ak {prefix}setmenuimage\n\n**Egzanp:**\n{prefix}setmenuimage https://i.postimg.cc/image.jpg\n\n**Reyajiste:** {prefix}setmenuimage reset\n\n💡 Ou ka itilize yon URL oswa reponn a yon imaj dirèkteman.\n\n📱 Sesyon: {phoneNumber}",
        setmenuimage_reset: "✅ Imaj menu reyajiste!\n\nImaj default retabli.\n\n📱 Sesyon: {phoneNumber}",
        setmenuimage_upload_success: "✅ Imaj menu aktyalize!\n\n**Nouvo imaj mete avèk siksè!**\n\n💡 Imaj la ap itilize pou kòmand menu a.\n\n📱 Sesyon: {phoneNumber}",
        setmenuimage_upload_error: "❌ Erè nan trete imaj\n\n{error}\n\nTanpri eseye ankò oswa itilize yon URL dirèk.",
        setmenuimage_url_success: "✅ Imaj menu aktyalize!\n\n**Nouvo URL:**\n{url}\n\n💡 Imaj la ap itilize pou kòmand menu a.\n\n📱 Sesyon: {phoneNumber}",
        setmenuimage_url_error: "❌ Erè nan konfigire imaj\n\n{error}\n\nURL a dwe kòmanse ak http:// oswa https://\nImaj aktyèl: {currentImage}",

        setephotoimage_help: "🎨 **Konfigirasyon Imaj Ephoto360**\n\n**Imaj Aktyèl:**\n{currentImage}\n\n**Itilizasyon:**\n• {prefix}setephotoimage <url>\n• Reponn a yon imaj ak {prefix}setephotoimage\n\n**Egzanp:**\n{prefix}setephotoimage https://i.postimg.cc/image.jpg\n\n**Reyajiste:** {prefix}setephotoimage reset\n\n💡 Ou ka itilize yon URL oswa reponn a yon imaj dirèkteman.\n\n📱 Sesyon: {phoneNumber}",
        setephotoimage_reset: "✅ Imaj Ephoto360 reyajiste!\n\nImaj default retabli.\n\n📱 Sesyon: {phoneNumber}",
        setephotoimage_upload_success: "✅ Imaj Ephoto360 aktyalize!\n\n**Nouvo imaj mete avèk siksè!**\n\n💡 Imaj la ap itilize pou menu ephoto360.\n\n📱 Sesyon: {phoneNumber}",
        setephotoimage_upload_error: "❌ Erè nan trete imaj\n\n{error}\n\nTanpri eseye ankò oswa itilize yon URL dirèk.",
        setephotoimage_url_success: "✅ Imaj Ephoto360 aktyalize!\n\n**Nouvo URL:**\n{url}\n\n💡 Imaj la ap itilize pou menu ephoto360.\n\n📱 Sesyon: {phoneNumber}",
        setephotoimage_url_error: "❌ Erè nan konfigire imaj\n\n{error}\n\nURL a dwe kòmanse ak http:// oswa https://\nImaj aktyèl: {currentImage}",

        setantilink_help: "🚫 **Konfigirasyon Limit Antilen**\n\n**Limit Aktyèl:** {currentLimit} avètisman\n\n**Itilizasyon:** {prefix}setantilink <nimewo>\n\n**Egzanp:**\n• {prefix}setantilink 3 - 3 avètisman anvan voye deyò\n• {prefix}setantilink 1 - Voye deyò imedyatman\n• {prefix}setantilink 5 - 5 chans anvan voye deyò\n\n**Reyajiste:** {prefix}setantilink reset\n\n⚠️ Minimòm: 1 | Maksimòm: 10\n\n📱 Sesyon: {phoneNumber}",
        setantilink_reset: "✅ Limit antilen reyajiste!\n\nNouvo limit: 3 avètisman\n\n📱 Sesyon: {phoneNumber}",
        setantilink_success: "✅ Limit antilen aktyalize!\n\n**Nouvo Limit:** {limit} avètisman\n\n💡 Manm yo ap voye deyò apre {limit} lyen detekte.\n\n📱 Sesyon: {phoneNumber}",
        setantilink_error: "Erè nan konfigire limit\n\n{error}\n\nLimit la dwe ant 1 ak 10\nLimit aktyèl: {currentLimit}",

        error_no_query: "Tanpri bay yon lyen oswa tit rechèch.",
        error_no_results: "Pa gen rezilva jwenn",
        error_audio_extraction: "Erè ekstrè odyo",
        error_video_not_found: "Video pa jwenn",
        error_download_link: "Lyen download pa jwenn",
        error_media_not_found: "Medya pa jwenn",
        error_audio_not_found: "Odyo pa jwenn",
        error_template_not_found: "Modèl pa jwenn",
        error_file_not_found: "Fichye pa jwenn",
        error_repo_not_found: "Depo pa jwenn",
        error_image_not_found: "Imaj pa jwenn",
        error_content_not_found: "Kontni pa jwenn",
        error_website_download: "Pa kapab download sit entènèt",
        unknown_artist: "Enkoni",

        downloader_searching: "🔍 Ap chèche:\n{query}",
        downloader_downloading: "📥 Ap download:\n{title}",

        downloader_tiktok_caption: "*sᴜᴋᴜɴᴀ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴅᴇsᴋʀɪᴘsʏᴏɴ:* {description}",
        downloader_facebook_caption: "*sᴜᴋᴜɴᴀ ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛ:* {title}",
        downloader_instagram_caption: "*sᴜᴋᴜɴᴀ ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_twitter_caption: "*sᴜᴋᴜɴᴀ ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_youtube_caption: "*sᴜᴋᴜɴᴀ ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴛɪᴛ:* {title}",
        downloader_music_caption: "*sᴜᴋᴜɴᴀ {service} ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Tit:* {title}\n👤 *Atis:* {artist}",
        downloader_capcut_caption: "*sᴜᴋᴜɴᴀ ᴄᴀᴘᴄᴜᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Tit:* {title}\n👁️ *Vizyon:* {views}",
        downloader_gdrive_caption: "*sᴜᴋᴜɴᴀ ɢᴅʀɪᴠᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Non:* {name}\n📦 *Gwosè:* {size}",
        downloader_github_caption: "*sᴜᴋᴜɴᴀ ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Repo:* {repo}\n👤 *Pwopriyetè:* {owner}\n⭐ *Zetwal:* {stars}\n🔀 *Fòk:* {forks}",
        downloader_mediafire_caption: "*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Non:* {name}\n📦 *Gwosè:* {size}\n📅 *Upload:* {uploaded}",
        downloader_pinterest_caption: "*sᴜᴋᴜɴᴀ ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_savefrom_caption: "*sᴜᴋᴜɴᴀ sᴀᴠᴇғʀᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Kalite:* {quality}\n📦 *Tip:* {type}",
        downloader_web2zip_caption: "*sᴜᴋᴜɴᴀ ᴡᴇʙ2ᴢɪᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Sit:* {site}",

        antispam_threshold_error: "Sèy la dwe ant {min} ak {max}.",
        antispam_on: "Pwoteksyon anti-spam kounye a aktive!\n\n• Sesyon: {phoneNumber}\n• Sèy: {threshold} mesaj nan 2 segonn\n• TOUT mesaj apre deteksyon ap efase\n• Voye deyò apre {threshold} avètisman",
        antispam_off: "Pwoteksyon anti-spam kounye a dezaktiye!\n\n• Sesyon: {phoneNumber}",

        antidelete_examples: "*Egzanp:*\n• {prefix}antidelete on\n• {prefix}antidelete off\n• {prefix}antidelete status",
        antidelete_status: "📊 *ESTATI ANTIDELETE*\n\n{status}\n📱 *Sesyon:* {phoneNumber}\n\n{description}",
        antidelete_already: "ℹ️ *Antidelete {status}*\n\nSistèm antidelete a {status} pou sesyon sa a.",
        antidelete_enabled: "✅ *Antidelete aktive*\n\n{description}\n\n📱 *Sesyon:* {phoneNumber}",
        antidelete_disabled: "❌ *Antidelete dezaktiye*\n\n{description}\n\n📱 *Sesyon:* {phoneNumber}",
        antidelete_enabled_desc: "🛡️ Mesaj efase yo ap kontwole ak backup.",
        antidelete_disabled_desc: "⚠️ Mesaj efase yo pa kontwole.",
        antidelete_enabled_details: "🛡️ Mesaj efase yo ap kounye a kontwole ak backup.\n\n📝 *Fonksyonalite:*\n• Kapti otomatik mesaj\n• Reykiperasyon medya efase\n• Anti-ViewOnce entegre\n• Depo lokal tanporè",
        antidelete_disabled_details: "⚠️ Mesaj efase yo p ap kontwole ankò.",

        groupsettings_reset_success: "Konfigirasyon gwoup reyajiste!\n\n• Sesyon: {phoneNumber}\n• Tout pwoteksyon yo dezaktiye",
        groupsettings_display: `📊 *Konfigirasyon Gwoup*\n\n🔗 *Antilen:* {antilink_status}\n   └ Sèy: {antilink_threshold} avètisman\n\n🚫 *Antispam:* {antispam_status}\n   └ Sèy: {antispam_threshold} avètisman\n\n@️⃣ *Antimention:* {antimention_status}\n\n🏷️ *Antitag:* {antitag_status}\n\n👋 *Akeyi:* {welcome_status}\n\n🚪 *Orevwa:* {goodbye_status}\n\n🔧 *Sesyon:* {phoneNumber}\n\n💡 Itilize \`groupsettings reset\` pou reyajiste tout bagay`,

        already_enabled: "deja aktive",
        already_disabled: "deja dezaktiye",

        media_name_required: "Tanpri bay yon non pou depo",
        media_already_exists: "Yon medya ki rele '{name}' ({type}) deja egziste.",
        media_stored_success: "✅ Medya '{name}' ({type}) estoke avèk siksè!",
        media_video_name_required: "📝 Tanpri espesifye non videyo a",
        media_video_not_found: "🚫 Pa gen videyo ki rele '{name}' jwenn",
        media_video_playing: "*sᴜᴋᴜɴᴀ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ*\n\n📌 *Non:* {name}",
        media_audio_name_required: "📝 Tanpri espesifye non odyo a",
        media_audio_not_found: "🚫 Pa gen odyo ki rele '{name}' jwenn",
        media_list: `*sᴜᴋᴜɴᴀ ᴋᴏʟᴇᴋsʏᴏɴ ᴍᴇᴅʏᴀ*\n\n{videos_count, select, 0 {} other {*🎬 ᴠɪᴅᴇʏᴏ ({videos_count})*\n{videos_list}\n\n}}{audios_count, select, 0 {} other {*🎵 ᴏᴅʏᴏ ({audios_count})*\n{audios_list}\n\n}}{videos_count, select, 0 {}{audios_count, select, 0 {*📭 ᴋᴏʟᴇᴋsʏᴏɴ ᴠɪᴅ*\n\n} other {}}}*ᴋòᴍᴀɴᴅ:*\n• {prefix}ᴠᴅ <ɴᴏɴ> [-ᴄ ᴘᴏᴜ ᴄɪʀᴋɪʟᴇ]\n• {prefix}ᴀᴅ <ɴᴏɴ>\n• {prefix}ᴅᴇʟ <ᴛɪᴘ> <ɴᴏɴ>`,
        media_delete_usage: "📝 Itilizasyon: .del <audio|video> <non>",
        media_deleted_success: "✅ Medya '{name}' ({type}) efase avèk siksè",
        media_not_found: "🚫 Medya '{name}' pa jwenn",
        sticker_error: "❌ Erè kreye sticker",
        sticker_steal_error: "❌ Erè jwenn sticker",

        vv_no_quoted: "Ou dwe reponn a yon mesaj yon sèl fwa wè.",
        vv_image_revealed: "*Imaj yon sèl fwa wè revele*\n\n{caption, select, {} other {Legend: {caption}\n}}",
        vv_video_revealed: "*Videyo yon sèl fwa wè revele*\n\n{caption, select, {} other {💬 Legend: {caption}\n}}",
        vv_invalid_message: "Mesaj site a pa yon mesaj yon sèl fwa wè valab.",
        vv_generic_error: "Yon erè rive pandan revele.",
        vv_buffer_empty: "Pa kapab download medya - fichye koripsyon oswa ekspire.",
        vv_media_expired: "Medya a pa disponib ankò sou sèvè WhatsApp.",
        vv_download_failed: "Echèk download - fichye a ka twò vye.",

        myconfig_display: `⚙️ *Anviwònman Pèsonèl Ou*\n\n📱 *Nimewo:* {phoneNumber}\n🤖 *Non Bot:* {botName}\n📝 *Prefiks:* {prefix}\n🌐 *Lang:* {language}\n\n📅 *Kreye:* {createdAt}\n🔄 *Aktyalize:* {updatedAt}\n\n🛠️ *Kòmand Konfigirasyon:*\n• {prefix}setname <non> - Chanje non bot\n• {prefix}setprefix <prefiks> - Chanje prefiks\n• {prefix}setlang <fr|en> - Chanje lang\n• {prefix}myconfig - Gade anviwònman sa yo\n\n💡 *Egzanp Itilizasyon:*\n{prefix}menu - Menu prensipal\n{prefix}ping - Tès koneksyon\n\n*Anviwònman Pèsonalize Aktif!* ✨`,

        autowrite_usage: "Itilizasyon: {prefix}autowrite <on/off/status>",
        autowrite_status: "✍️ *Estati Autowrite*\n\n📱 *Sesyon:* {phoneNumber}\n⚡ *Estati:* {status}",
        autowrite_already: "ℹ️ Autowrite {status}",
        autowrite_enabled: "✍️ Similasyon ekriti aktive!\n\nBot la ap simile ekriti otomatikman.\n\n📱 Sesyon: {phoneNumber}",
        autowrite_disabled: "❌ Similasyon ekriti dezaktiye!\n\n📱 Sesyon: {phoneNumber}",

        autoreact_usage: "Itilizasyon: {prefix}autoreact <on/off/status/emojis> [emojis]",
        autoreact_status: "🎭 *Estati Autoreact*\n\n📱 *Sesyon:* {phoneNumber}\n⚡ *Estati:* {status}\n😊 *Emoji:* {emojis}",
        autoreact_already: "ℹ️ Autoreact {status}",
        autoreact_enabled: "🎭 Reyaksyon otomatik aktive!\n\nBot la ap reyaji otomatikman ak mesaj yo.\n\n😊 Emoji: {emojis}\n📱 Sesyon: {phoneNumber}",
        autoreact_disabled: "❌ Reyaksyon otomatik dezaktiye!\n\n📱 Sesyon: {phoneNumber}",
        autoreact_emojis_required: "Tanpri espesifye emoji",
        autoreact_emojis_updated: "✅ Emoji reyaksyon aktyalize!\n\nNouvo emoji: {emojis}",

        autostatus_usage: "Itilizasyon: {prefix}autostatus <view/react/status> <on/off> [emoji]",
        autostatus_status: "👁️ *Estati Autostatus*\n\n📱 *Sesyon:* {phoneNumber}\n👁️ *Gade:* {viewStatus}\n❤️ *Reyaksyon:* {reactStatus}\n😊 *Emoji:* {reactEmoji}",
        autostatus_view_usage: "Itilizasyon: {prefix}autostatus view <on/off>",
        autostatus_react_usage: "Itilizasyon: {prefix}autostatus react <on/off/emoji> [emoji]",
        autostatus_emoji_required: "Tanpri espesifye yon emoji",
        autostatus_view_enabled: "👁️ Gade otomatik estati aktive!\n\nBot la ap wè otomatikman tout estati yo.\n\n📱 Sesyon: {phoneNumber}",
        autostatus_view_disabled: "❌ Gade otomatik estati dezaktiye!\n\n📱 Sesyon: {phoneNumber}",
        autostatus_react_enabled: "❤️ Reyaksyon otomatik estati aktive!\n\nBot la ap reyaji otomatikman ak estati yo.\n\n😊 Emoji: {emoji}\n📱 Sesyon: {phoneNumber}",
        autostatus_react_disabled: "❌ Reyaksyon otomatik estati dezaktiye!\n\n📱 Sesyon: {phoneNumber}",
        autostatus_emoji_updated: "✅ Emoji reyaksyon aktyalize!\n\nNouvo emoji: {emoji}",

        save_no_quoted: "Ou dwe reponn a yon estati pou sove li.",
        save_downloading: "⏳ Ap download estati...",
        save_unsupported: "❌ Tip estati pa sipòte",
        save_success: "💾 Estati sove avèk siksè!\n\n📁 Tip: {type}\n📝 Fichye: {fileName}",
        save_error: "❌ Erè sove estati\n\n{error}",

        url_no_image: "Ou dwe reponn a yon imaj pou konvèti li an URL.",
        url_uploading: "⏳ Ap konvèti imaj an URL...",
        url_success: "🔗 Imaj konvèti an URL!\n\n📎 Lyen: {url}",
        url_error: "❌ Erè pandan konvèsyon\n\n{error}",

        setlang_help: `🌐 Konfigirasyon Lang\n\nLang aktyèl: {currentLang}\n\nItilizasyon: {prefix}setlang <fr/en/es/ht/id>\n\nEgzanp:\n• {prefix}setlang fr - Français\n• {prefix}setlang en - English\n• {prefix}setlang es - Español\n• {prefix}setlang ht - Kreyòl Ayisyen\n• {prefix}setlang id - Bahasa Indonesia\n\n📱 Nòt: Lang sa a aplike a tout repons bot la pou sesyon w`,
        setlang_success: "✅ Lang aktyalize avèk siksè!\n\nNouvo lang: {langName}\nSesyon: {phoneNumber}\n\nTout repons bot la ap kounye a nan lang chwazi a! 🎉",
        setlang_error: "❌ Erè konfigire lang\n\n{error}\n\nLang sipòte: fr, en, es, ht, id\nLang aktyèl: {currentLang}",
    
     antidelete_detected: `🗑️ **MESAJ EFASE DETEKTE**\n\n🚫 **Efase pa:** @{deletedByName}\n👤 **Moun ki voye:** @{senderName}\n📱 **Nimewo:** {sender}\n🕒 **Lè:** {time}\n📱 **Sesyon:** {phoneNumber}\n👥 **Gwoup:** {groupName}\n\n💬 **Mesaj efase:**\n{content}`,
        
        media_or_special_message: '[Medya oswa mesaj espesyal]',
        
        deleted_media_recovered: `📎 **{mediaType} EFASE REKIpere**\nMoun ki voye: @{senderName}\nSesyon: {phoneNumber}`,
        
        media_send_error: `⚠️ Erè voye medya: {error}`,
        
        unknown_group: 'Gwoup enkoni',

        antiviewonce_detected: `🔍 *Anti-ViewOnce {mediaType}*\nMoun ki voye: @{senderName}\nSesyon: {phoneNumber}`,
        
        // 🗑️ Anti-Delete
        antidelete_detected: `🗑️ **MESAJ EFASE DETEKTE**\n\n🚫 **Efase pa:** @{deletedByName}\n👤 **Moun ki voye:** @{senderName}\n📱 **Nimewo:** {sender}\n🕒 **Lè:** {time}\n📱 **Sesyon:** {phoneNumber}\n👥 **Gwoup:** {groupName}\n\n💬 **Mesaj efase:**\n{content}`,
        media_or_special_message: '[Medya oswa mesaj espesyal]',
        deleted_media_recovered: `📎 **{mediaType} EFASE REKIpere**\nMoun ki voye: @{senderName}\nSesyon: {phoneNumber}`,
        media_send_error: `⚠️ Erè voye medya: {error}`,
        unknown_group: 'Gwoup enkoni',
        
        // 🌟 Welcome/Bienvenue
        welcome_online: `🎉 *𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗 kounye a sou liy!*\n\n*Sesyon:* {phoneNumber}\n*Prefiks:* \`{prefix}\`\n\n*Tape* \`{prefix}menu\` *pou komanse!*\n\nte fè pa stephdev`,
        
        // 👋 Welcome/Goodbye Group
        welcome_default: `👋 𝐁𝐲𝐞𝐧𝐯𝐞𝐧𝐢 @{user} !\n\n🎉 Byenveni nan {group}\n\n📊 Manm: {members}\n📝 Deskripsyon: {desc}\n\n_Jwi sejour ou!_`,
        goodbye_default: `👋 𝐎𝐫𝐞𝐯𝐰𝐚 @{user}\n\n😢 Yon manm kite {group}\n\n📊 Manm ki rete: {members}\n\n_Nou espere wè ou ankò talè!_`,
        no_description: 'Pa gen deskripsyon',
        
        // 🛡️ Pwoteksyon gwoup
        spam_detected: `🚨 SPAM DETEKTE! Tout mesaj efase.\n@{senderPhone} - Avètisman {currentWarnings}/{maxWarnings}`,
        user_kicked_spam: `🚫 @{senderPhone} mete deyò pou spam repete.`,
        
        link_detected: `🚫 Lyen detekte nan @{senderPhone}. Avètisman {currentWarnings}/{maxWarnings}.`,
        user_kicked_links: `🚫 @{senderPhone} mete deyò pou lyen repete.`,
        
        mass_tag_detected: `🚫 Tag an mas detekte ({reason}) pa @{senderPhone}. Mesaj efase.`,
        
        group_mention_detected: `🚫 Mention gwoup entèdi pa @{senderPhone}.`,
        
        // ❌ Erè kòmand
        unknown_command: `❌ *Kòmand enkoni: \`{command}\`*\n\nTape *{prefix}menu* pou wè tout kòmand ki disponib!\n\n_{botName} - Sesyon {phoneNumber}_`,
        
        command_error: `⚠️ *Erè nan ekzekite kòmand la*\n\n*Kòmand:* \`{command}\`\n*Erè:* {error}`,
        
        // 📱 Lòt
        none: 'Okenn',
        private_chat: 'Chat prive', 
        link_initializing: '⏳ Inisyalizasyon sesyon pou {number}...',
link_connected: '✅ Nimewo {number} konekte avèk siksè nan {time}',
link_disconnected: '📵 Nimewo {number} dekonekte. Rezon: {reason}',
link_error: '❌ Erè ak {number}: {error}',
link_pairing_code: '🔑 Kòd paryaj pou {number}: {code}',
number_label: 'Nimewo',
pairing_code_label: 'Kòd paryaj',
code_valid_60s: 'Kòd ou a valab pou 60 segonn',
error_already_connected: '⚠️ Nimewo {number} deja konekte',
error_owner_only: '❌ Kòmand sa a rezève pou mèt bot la',
dellink_disconnecting: '⏳ Ap dekonekte {number}...',
dellink_deleting_inactive: '🗑️ Ap efase sesyon inaktif {number}...',
dellink_success: '✅ Sesyon {number} dekonekte avèk siksè',
dellink_deleted: '✅ Sesyon {number} efase avèk siksè',

    },
    
    id: {
        // Pesan error
        error_group_only: "Perintah ini hanya dapat digunakan di grup.",
        error_admin_only: "Anda harus menjadi admin untuk menggunakan perintah ini.",
        error_owner_only: "Perintah ini hanya untuk pemilik bot.",
        error_invalid_usage: "Penggunaan tidak valid. Gunakan",
        error_not_found: "Tidak ditemukan",
        error_occurred: "Terjadi kesalahan",
        
        // Pesan sukses
        success_activated: "berhasil diaktifkan",
        success_deactivated: "berhasil dinonaktifkan",
        success_updated: "berhasil diperbarui",
        success_reset: "berhasil direset",
        
        // Selamat datang/Selamat tinggal
        welcome_default: "👋 𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐃𝐚𝐭𝐚𝐧𝐠",
        welcome_in_group: "Selamat datang di",
        goodbye_default: "👋 𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐓𝐢𝐧𝐠𝐠𝐚𝐥",
        goodbye_left_group: "Anggota keluar",
        members: "Anggota",
        description: "Deskripsi",
        no_description: "Tidak ada deskripsi",
        enjoy_stay: "Selamat menikmati!",
        hope_see_again: "Kami berharap bertemu lagi!",
        
        // Peringatan
        warnings_title: "Peringatan untuk",
        warnings_group_title: "Peringatan grup",
        warnings_reset: "Peringatan direset untuk",
        warnings_reset_all: "Semua peringatan telah direset",
        warnings_none: "Tidak ada peringatan di grup ini",
        antilink_label: "Antilink",
        antispam_label: "Antispam",
        
        // Konfigurasi
        config_prefix: "Prefiks",
        config_botname: "Nama bot",
        config_language: "Bahasa",
        config_current: "Konfigurasi saat ini",
        config_updated: "Konfigurasi diperbarui",
        config_usage: "Penggunaan",
        config_example: "Contoh",
        
        // Antilink
        antilink_enabled: "Perlindungan anti-link sekarang diaktifkan",
        antilink_disabled: "Perlindungan anti-link sekarang dinonaktifkan",
        antilink_detected: "Link terdeteksi dari",
        antilink_warning: "Peringatan",
        antilink_kicked: "dikeluarkan karena link berulang",
        
        // Antispam
        antispam_detected: "SPAM TERDETEKSI! Semua pesan dihapus",
        antispam_kicked: "dikeluarkan karena spam berulang",
        
        // Perlindungan
        protection_status: "Status",
        protection_enabled: "diaktifkan ✅",
        protection_disabled: "dinonaktifkan ❌",
        
        // Lainnya
        session: "Sesi",
        status: "Status",
        total: "Total",
        user: "pengguna",
        users: "pengguna",
        remaining_days: "Hari tersisa",

        group_link_text: "🔗 Berikut undangan untuk bergabung dengan wilayah kami:\n\n{link}",
        lock_feature: "Kunci grup",
        unlock_feature: "Buka kunci grup",
        members_kicked: "{count} anggota dikeluarkan",
        members_to_kick: "anggota akan dikeluarkan",
        user_added: "Pengguna ditambahkan",
        member_kicked: "Anggota dikeluarkan",
        member_promoted: "Anggota dipromosikan jadi admin",
        member_demoted: "Anggota diturunkan",
        welcome_feature: "Selamat datang",
        goodbye_feature: "Selamat tinggal",

        tagall_message: "ᴀᴛᴇɴsɪ sᴇᴍᴜᴀ!",
        alive_status: "sukuna ᴏɴʟɪɴᴇ sᴇʟᴀᴍᴀ {hours}ᴊ{minutes}ᴍ",
        antilink_enabled: "Perlindungan anti-link sekarang diaktifkan!\n\n• Sesi: {phoneNumber}\n• Pengguna akan dikeluarkan setelah {threshold} peringatan",
        antilink_disabled: "Perlindungan anti-link sekarang dinonaktifkan!\n\n• Sesi: {phoneNumber}",
        antimention_enabled: "Perlindungan anti-mention sekarang diaktifkan!\n\n• Sesi: {phoneNumber}\n• Memblokir semua mention grup\n• Pesan dengan mention akan dihapus",
        antimention_disabled: "Perlindungan anti-mention sekarang dinonaktifkan!\n\n• Sesi: {phoneNumber}",

        error_owner_only: "Perintah ini hanya dapat digunakan secara pribadi oleh pemilik bot.",
        upload_in_progress: "⏳ Upload gambar sedang berlangsung...",
        upload_failed: "Upload gambar gagal",

        setmenuimage_help: "🖼️ **Konfigurasi Gambar Menu**\n\n**Gambar Saat Ini:**\n{currentImage}\n\n**Penggunaan:**\n• {prefix}setmenuimage <url>\n• Balas gambar dengan {prefix}setmenuimage\n\n**Contoh:**\n{prefix}setmenuimage https://i.postimg.cc/image.jpg\n\n**Reset:** {prefix}setmenuimage reset\n\n💡 Anda bisa menggunakan URL atau membalas gambar langsung.\n\n📱 Sesi: {phoneNumber}",
        setmenuimage_reset: "✅ Gambar menu direset!\n\nGambar default dipulihkan.\n\n📱 Sesi: {phoneNumber}",
        setmenuimage_upload_success: "✅ Gambar menu diperbarui!\n\n**Gambar baru berhasil ditetapkan!**\n\n💡 Gambar akan digunakan untuk perintah menu.\n\n📱 Sesi: {phoneNumber}",
        setmenuimage_upload_error: "❌ Error memproses gambar\n\n{error}\n\nSilakan coba lagi atau gunakan URL langsung.",
        setmenuimage_url_success: "✅ Gambar menu diperbarui!\n\n**URL Baru:**\n{url}\n\n💡 Gambar akan digunakan untuk perintah menu.\n\n📱 Sesi: {phoneNumber}",
        setmenuimage_url_error: "❌ Error mengkonfigurasi gambar\n\n{error}\n\nURL harus dimulai dengan http:// atau https://\nGambar saat ini: {currentImage}",

        setephotoimage_help: "🎨 **Konfigurasi Gambar Ephoto360**\n\n**Gambar Saat Ini:**\n{currentImage}\n\n**Penggunaan:**\n• {prefix}setephotoimage <url>\n• Balas gambar dengan {prefix}setephotoimage\n\n**Contoh:**\n{prefix}setephotoimage https://i.postimg.cc/image.jpg\n\n**Reset:** {prefix}setephotoimage reset\n\n💡 Anda bisa menggunakan URL atau membalas gambar langsung.\n\n📱 Sesi: {phoneNumber}",
        setephotoimage_reset: "✅ Gambar Ephoto360 direset!\n\nGambar default dipulihkan.\n\n📱 Sesi: {phoneNumber}",
        setephotoimage_upload_success: "✅ Gambar Ephoto360 diperbarui!\n\n**Gambar baru berhasil ditetapkan!**\n\n💡 Gambar akan digunakan untuk menu ephoto360.\n\n📱 Sesi: {phoneNumber}",
        setephotoimage_upload_error: "❌ Error memproses gambar\n\n{error}\n\nSilakan coba lagi atau gunakan URL langsung.",
        setephotoimage_url_success: "✅ Gambar Ephoto360 diperbarui!\n\n**URL Baru:**\n{url}\n\n💡 Gambar akan digunakan untuk menu ephoto360.\n\n📱 Sesi: {phoneNumber}",
        setephotoimage_url_error: "❌ Error mengkonfigurasi gambar\n\n{error}\n\nURL harus dimulai dengan http:// atau https://\nGambar saat ini: {currentImage}",

        setantilink_help: "🚫 **Konfigurasi Batas Antilink**\n\n**Batas Saat Ini:** {currentLimit} peringatan\n\n**Penggunaan:** {prefix}setantilink <angka>\n\n**Contoh:**\n• {prefix}setantilink 3 - 3 peringatan sebelum dikeluarkan\n• {prefix}setantilink 1 - Langsung dikeluarkan\n• {prefix}setantilink 5 - 5 kesempatan sebelum dikeluarkan\n\n**Reset:** {prefix}setantilink reset\n\n⚠️ Minimum: 1 | Maksimum: 10\n\n📱 Sesi: {phoneNumber}",
        setantilink_reset: "✅ Batas antilink direset!\n\nBatas baru: 3 peringatan\n\n📱 Sesi: {phoneNumber}",
        setantilink_success: "✅ Batas antilink diperbarui!\n\n**Batas Baru:** {limit} peringatan\n\n💡 Anggota akan dikeluarkan setelah {limit} link terdeteksi.\n\n📱 Sesi: {phoneNumber}",
        setantilink_error: "Error mengkonfigurasi batas\n\n{error}\n\nBatas harus antara 1 dan 10\nBatas saat ini: {currentLimit}",

        error_no_query: "Silakan berikan link atau judul pencarian.",
        error_no_results: "Tidak ada hasil ditemukan",
        error_audio_extraction: "Error mengekstrak audio",
        error_video_not_found: "Video tidak ditemukan",
        error_download_link: "Link download tidak ditemukan",
        error_media_not_found: "Media tidak ditemukan",
        error_audio_not_found: "Audio tidak ditemukan",
        error_template_not_found: "Template tidak ditemukan",
        error_file_not_found: "File tidak ditemukan",
        error_repo_not_found: "Repositori tidak ditemukan",
        error_image_not_found: "Gambar tidak ditemukan",
        error_content_not_found: "Konten tidak ditemukan",
        error_website_download: "Tidak dapat mendownload situs web",
        unknown_artist: "Tidak diketahui",

        downloader_searching: "🔍 Mencari:\n{query}",
        downloader_downloading: "📥 Mendownload:\n{title}",

        downloader_tiktok_caption: "*sᴜᴋᴜɴᴀ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴅᴇsᴋʀɪᴘsɪ:* {description}",
        downloader_facebook_caption: "*sᴜᴋᴜɴᴀ ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴊᴜᴅᴜʟ:* {title}",
        downloader_instagram_caption: "*sᴜᴋᴜɴᴀ ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_twitter_caption: "*sᴜᴋᴜɴᴀ ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_youtube_caption: "*sᴜᴋᴜɴᴀ ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*ᴊᴜᴅᴜʟ:* {title}",
        downloader_music_caption: "*sᴜᴋᴜɴᴀ {service} ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Judul:* {title}\n👤 *Artis:* {artist}",
        downloader_capcut_caption: "*sᴜᴋᴜɴᴀ ᴄᴀᴘᴄᴜᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Judul:* {title}\n👁️ *Dilihat:* {views}",
        downloader_gdrive_caption: "*sᴜᴋᴜɴᴀ ɢᴅʀɪᴠᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nama:* {name}\n📦 *Ukuran:* {size}",
        downloader_github_caption: "*sᴜᴋᴜɴᴀ ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Repo:* {repo}\n👤 *Pemilik:* {owner}\n⭐ *Bintang:* {stars}\n🔀 *Fork:* {forks}",
        downloader_mediafire_caption: "*sᴜᴋᴜɴᴀ ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Nama:* {name}\n📦 *Ukuran:* {size}\n📅 *Upload:* {uploaded}",
        downloader_pinterest_caption: "*sᴜᴋᴜɴᴀ ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*",
        downloader_savefrom_caption: "*sᴜᴋᴜɴᴀ sᴀᴠᴇғʀᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Kualitas:* {quality}\n📦 *Tipe:* {type}",
        downloader_web2zip_caption: "*sᴜᴋᴜɴᴀ ᴡᴇʙ2ᴢɪᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n📌 *Situs:* {site}",

        antispam_threshold_error: "Ambang batas harus antara {min} dan {max}.",
        antispam_on: "Perlindungan anti-spam sekarang diaktifkan!\n\n• Sesi: {phoneNumber}\n• Ambang batas: {threshold} pesan dalam 2 detik\n• SEMUA pesan setelah deteksi akan dihapus\n• Keluarkan setelah {threshold} peringatan",
        antispam_off: "Perlindungan anti-spam sekarang dinonaktifkan!\n\n• Sesi: {phoneNumber}",

        antidelete_examples: "*Contoh:*\n• {prefix}antidelete on\n• {prefix}antidelete off\n• {prefix}antidelete status",
        antidelete_status: "📊 *STATUS ANTIDELETE*\n\n{status}\n📱 *Sesi:* {phoneNumber}\n\n{description}",
        antidelete_already: "ℹ️ *Antidelete {status}*\n\nSistem antidelete {status} untuk sesi ini.",
        antidelete_enabled: "✅ *Antidelete diaktifkan*\n\n{description}\n\n📱 *Sesi:* {phoneNumber}",
        antidelete_disabled: "❌ *Antidelete dinonaktifkan*\n\n{description}\n\n📱 *Sesi:* {phoneNumber}",
        antidelete_enabled_desc: "🛡️ Pesan yang dihapus dipantau dan dicadangkan.",
        antidelete_disabled_desc: "⚠️ Pesan yang dihapus tidak dipantau.",
        antidelete_enabled_details: "🛡️ Pesan yang dihapus sekarang akan dipantau dan dicadangkan.\n\n📝 *Fitur:*\n• Penangkapan pesan otomatis\n• Pemulihan media yang dihapus\n• Anti-ViewOnce terintegrasi\n• Penyimpanan lokal sementara",
        antidelete_disabled_details: "⚠️ Pesan yang dihapus tidak akan dipantau lagi.",

        groupsettings_reset_success: "Konfigurasi grup direset!\n\n• Sesi: {phoneNumber}\n• Semua perlindungan dinonaktifkan",
        groupsettings_display: `📊 *Konfigurasi Grup*\n\n🔗 *Antilink:* {antilink_status}\n   └ Ambang: {antilink_threshold} peringatan\n\n🚫 *Antispam:* {antispam_status}\n   └ Ambang: {antispam_threshold} peringatan\n\n@️⃣ *Antimention:* {antimention_status}\n\n🏷️ *Antitag:* {antitag_status}\n\n👋 *Selamat datang:* {welcome_status}\n\n🚪 *Selamat tinggal:* {goodbye_status}\n\n🔧 *Sesi:* {phoneNumber}\n\n💡 Gunakan \`groupsettings reset\` untuk mereset semuanya`,

        already_enabled: "sudah diaktifkan",
        already_disabled: "sudah dinonaktifkan",

        media_name_required: "Silakan berikan nama untuk penyimpanan",
        media_already_exists: "Media bernama '{name}' ({type}) sudah ada.",
        media_stored_success: "✅ Media '{name}' ({type}) berhasil disimpan!",
        media_video_name_required: "📝 Silakan tentukan nama video",
        media_video_not_found: "🚫 Tidak ada video bernama '{name}' ditemukan",
        media_video_playing: "*sᴜᴋᴜɴᴀ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ*\n\n📌 *Nama:* {name}",
        media_audio_name_required: "📝 Silakan tentukan nama audio",
        media_audio_not_found: "🚫 Tidak ada audio bernama '{name}' ditemukan",
        media_list: `*sᴜᴋᴜɴᴀ ᴋᴏʟᴇᴋsɪ ᴍᴇᴅɪᴀ*\n\n{videos_count, select, 0 {} other {*🎬 ᴠɪᴅᴇᴏ ({videos_count})*\n{videos_list}\n\n}}{audios_count, select, 0 {} other {*🎵 ᴀᴜᴅɪᴏ ({audios_count})*\n{audios_list}\n\n}}{videos_count, select, 0 {}{audios_count, select, 0 {*📭 ᴋᴏʟᴇᴋsɪ ᴋᴏsᴏɴɢ*\n\n} other {}}}*ᴘᴇʀɪɴᴛᴀʜ:*\n• {prefix}ᴠᴅ <ɴᴀᴍᴀ> [-ᴄ ᴜɴᴛᴜᴋ ᴍᴇᴍᴜᴛᴀʀ ᴛᴇʀᴜs]\n• {prefix}ᴀᴅ <ɴᴀᴍᴀ>\n• {prefix}ᴅᴇʟ <ᴛɪᴘᴇ> <ɴᴀᴍᴀ>`,
        media_delete_usage: "📝 Penggunaan: .del <audio|video> <nama>",
        media_deleted_success: "✅ Media '{name}' ({type}) berhasil dihapus",
        media_not_found: "🚫 Media '{name}' tidak ditemukan",
        sticker_error: "❌ Error membuat stiker",
        sticker_steal_error: "❌ Error mengambil stiker",

        vv_no_quoted: "Anda harus membalas pesan sekali lihat.",
        vv_image_revealed: "*Gambar sekali lihat terungkap*\n\n{caption, select, {} other {Keterangan: {caption}\n}}",
        vv_video_revealed: "*Video sekali lihat terungkap*\n\n{caption, select, {} other {💬 Keterangan: {caption}\n}}",
        vv_invalid_message: "Pesan yang dibalas bukan pesan sekali lihat yang valid.",
        vv_generic_error: "Terjadi kesalahan saat mengungkap.",
        vv_buffer_empty: "Tidak dapat mengunduh media - file rusak atau kedaluwarsa.",
        vv_media_expired: "Media tidak lagi tersedia di server WhatsApp.",
        vv_download_failed: "Unduhan gagal - file mungkin terlalu lama.",

        myconfig_display: `⚙️ *Pengaturan Pribadi Anda*\n\n📱 *Nomor:* {phoneNumber}\n🤖 *Nama Bot:* {botName}\n📝 *Prefiks:* {prefix}\n🌐 *Bahasa:* {language}\n\n📅 *Dibuat:* {createdAt}\n🔄 *Diperbarui:* {updatedAt}\n\n🛠️ *Perintah Konfigurasi:*\n• {prefix}setname <nama> - Ubah nama bot\n• {prefix}setprefix <prefiks> - Ubah prefiks\n• {prefix}setlang <fr|en> - Ubah bahasa\n• {prefix}myconfig - Lihat pengaturan ini\n\n💡 *Contoh Penggunaan:*\n{prefix}menu - Menu utama\n{prefix}ping - Tes koneksi\n\n*Konfigurasi Kustom Aktif!* ✨`,

        autowrite_usage: "Penggunaan: {prefix}autowrite <on/off/status>",
        autowrite_status: "✍️ *Status Autowrite*\n\n📱 *Sesi:* {phoneNumber}\n⚡ *Status:* {status}",
        autowrite_already: "ℹ️ Autowrite {status}",
        autowrite_enabled: "✍️ Simulasi pengetikan diaktifkan!\n\nBot akan secara otomatis mensimulasikan pengetikan.\n\n📱 Sesi: {phoneNumber}",
        autowrite_disabled: "❌ Simulasi pengetikan dinonaktifkan!\n\n📱 Sesi: {phoneNumber}",

        autoreact_usage: "Penggunaan: {prefix}autoreact <on/off/status/emojis> [emojis]",
        autoreact_status: "🎭 *Status Autoreact*\n\n📱 *Sesi:* {phoneNumber}\n⚡ *Status:* {status}\n😊 *Emoji:* {emojis}",
        autoreact_already: "ℹ️ Autoreact {status}",
        autoreact_enabled: "🎭 Reaksi otomatis diaktifkan!\n\nBot akan secara otomatis bereaksi terhadap pesan.\n\n😊 Emoji: {emojis}\n📱 Sesi: {phoneNumber}",
        autoreact_disabled: "❌ Reaksi otomatis dinonaktifkan!\n\n📱 Sesi: {phoneNumber}",
        autoreact_emojis_required: "Silakan tentukan emoji",
        autoreact_emojis_updated: "✅ Emoji reaksi diperbarui!\n\nEmoji baru: {emojis}",

        autostatus_usage: "Penggunaan: {prefix}autostatus <view/react/status> <on/off> [emoji]",
        autostatus_status: "👁️ *Status Autostatus*\n\n📱 *Sesi:* {phoneNumber}\n👁️ *Melihat:* {viewStatus}\n❤️ *Reaksi:* {reactStatus}\n😊 *Emoji:* {reactEmoji}",
        autostatus_view_usage: "Penggunaan: {prefix}autostatus view <on/off>",
        autostatus_react_usage: "Penggunaan: {prefix}autostatus react <on/off/emoji> [emoji]",
        autostatus_emoji_required: "Silakan tentukan emoji",
        autostatus_view_enabled: "👁️ Melihat status otomatis diaktifkan!\n\nBot akan secara otomatis melihat semua status.\n\n📱 Sesi: {phoneNumber}",
        autostatus_view_disabled: "❌ Melihat status otomatis dinonaktifkan!\n\n📱 Sesi: {phoneNumber}",
        autostatus_react_enabled: "❤️ Reaksi status otomatis diaktifkan!\n\nBot akan secara otomatis bereaksi terhadap status.\n\n😊 Emoji: {emoji}\n📱 Sesi: {phoneNumber}",
        autostatus_react_disabled: "❌ Reaksi status otomatis dinonaktifkan!\n\n📱 Sesi: {phoneNumber}",
        autostatus_emoji_updated: "✅ Emoji reaksi diperbarui!\n\nEmoji baru: {emoji}",

        save_no_quoted: "Anda harus membalas status untuk menyimpannya.",
        save_downloading: "⏳ Mengunduh status...",
        save_unsupported: "❌ Jenis status tidak didukung",
        save_success: "💾 Status berhasil disimpan!\n\n📁 Jenis: {type}\n📝 File: {fileName}",
        save_error: "❌ Error menyimpan status\n\n{error}",

        url_no_image: "Anda harus membalas gambar untuk mengonversinya ke URL.",
        url_uploading: "⏳ Mengonversi gambar ke URL...",
        url_success: "🔗 Gambar berhasil dikonversi ke URL!\n\n📎 Tautan: {url}",
        url_error: "❌ Error selama konversi\n\n{error}",

        setlang_help: `🌐 Konfigurasi Bahasa\n\nBahasa saat ini: {currentLang}\n\nPenggunaan: {prefix}setlang <fr/en/es/ht/id>\n\nContoh:\n• {prefix}setlang fr - Français\n• {prefix}setlang en - English\n• {prefix}setlang es - Español\n• {prefix}setlang ht - Kreyòl Ayisyen\n• {prefix}setlang id - Bahasa Indonesia\n\n📱 Catatan: Bahasa ini berlaku untuk semua respons bot untuk sesi Anda`,
        setlang_success: "✅ Bahasa berhasil diperbarui!\n\nBahasa baru: {langName}\nSesi: {phoneNumber}\n\nSemua respons bot sekarang akan dalam bahasa yang dipilih! 🎉",
        setlang_error: "❌ Error mengkonfigurasi bahasa\n\n{error}\n\nBahasa yang didukung: fr, en, es, ht, id\nBahasa saat ini: {currentLang}",
    
    
    antidelete_detected: `🗑️ **PESAN DIHAPUS TERDETEKSI**\n\n🚫 **Dihapus oleh:** @{deletedByName}\n👤 **Pengirim:** @{senderName}\n📱 **Nomor:** {sender}\n🕒 **Waktu:** {time}\n📱 **Sesi:** {phoneNumber}\n👥 **Grup:** {groupName}\n\n💬 **Pesan yang dihapus:**\n{content}`,
        
        media_or_special_message: '[Media atau pesan khusus]',
        
        deleted_media_recovered: `📎 **{mediaType} DIHAPUS DIPULIHKAN**\nPengirim: @{senderName}\nSesi: {phoneNumber}`,
        
        media_send_error: `⚠️ Error kirim media: {error}`,
        
        unknown_group: 'Grup tidak dikenal',

        antiviewonce_detected: `🔍 *Anti-ViewOnce {mediaType}*\nPengirim: @{senderName}\nSesi: {phoneNumber}`,
        
        // 🗑️ Anti-Delete
        antidelete_detected: `🗑️ **PESAN DIHAPUS TERDETEKSI**\n\n🚫 **Dihapus oleh:** @{deletedByName}\n👤 **Pengirim:** @{senderName}\n📱 **Nomor:** {sender}\n🕒 **Waktu:** {time}\n📱 **Sesi:** {phoneNumber}\n👥 **Grup:** {groupName}\n\n💬 **Pesan yang dihapus:**\n{content}`,
        media_or_special_message: '[Media atau pesan khusus]',
        deleted_media_recovered: `📎 **{mediaType} DIHAPUS DIPULIHKAN**\nPengirim: @{senderName}\nSesi: {phoneNumber}`,
        media_send_error: `⚠️ Error kirim media: {error}`,
        unknown_group: 'Grup tidak dikenal',
        
        // 🌟 Welcome/Bienvenue
        welcome_online: `🎉 *sukuna sekarang online!*\n\n*Sesi:* {phoneNumber}\n*Prefiks:* \`{prefix}\`\n\n*Ketik* \`{prefix}menu\` *untuk memulai!*\n\ndibuat oleh stephdev`,
        
        // 👋 Welcome/Goodbye Group
        welcome_default: `👋 𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐃𝐚𝐭𝐚𝐧𝐠 @{user} !\n\n🎉 Selamat datang di {group}\n\n📊 Anggota: {members}\n📝 Deskripsi: {desc}\n\n_Selamat menikmati!_`,
        goodbye_default: `👋 𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐓𝐢𝐧𝐠𝐠𝐚𝐥 @{user}\n\n😢 Seorang anggota meninggalkan {group}\n\n📊 Anggota tersisa: {members}\n\n_Semoga bertemu lagi!_`,
        no_description: 'Tidak ada deskripsi',
        
        // 🛡️ Perlindungan grup
        spam_detected: `🚨 SPAM TERDETEKSI! Semua pesan dihapus.\n@{senderPhone} - Peringatan {currentWarnings}/{maxWarnings}`,
        user_kicked_spam: `🚫 @{senderPhone} diusir karena spam berulang.`,
        
        link_detected: `🚫 Tautan terdeteksi dari @{senderPhone}. Peringatan {currentWarnings}/{maxWarnings}.`,
        user_kicked_links: `🚫 @{senderPhone} diusir karena tautan berulang.`,
        
        mass_tag_detected: `🚫 Tag massal terdeteksi ({reason}) oleh @{senderPhone}. Pesan dihapus.`,
        
        group_mention_detected: `🚫 Penyebutan grup dilarang oleh @{senderPhone}.`,
        
        // ❌ Kesalahan perintah
        unknown_command: `❌ *Perintah tidak dikenal: \`{command}\`*\n\nKetik *{prefix}menu* untuk melihat semua perintah yang tersedia!\n\n_{botName} - Sesi {phoneNumber}_`,
        
        command_error: `⚠️ *Kesalahan menjalankan perintah*\n\n*Perintah:* \`{command}\`\n*Kesalahan:* {error}`,
        
        // 📱 Lainnya
        none: 'Tidak ada',
        private_chat: 'Obrolan pribadi', 
        link_initializing: '⏳ Inisialisasi sesi untuk {number}...',
link_connected: '✅ Nomor {number} berhasil terhubung pada {time}',
link_disconnected: '📵 Nomor {number} terputus. Alasan: {reason}',
link_error: '❌ Kesalahan dengan {number}: {error}',
link_pairing_code: '🔑 Kode pemasangan untuk {number}: {code}',
number_label: 'Nomor',
pairing_code_label: 'Kode pemasangan',
code_valid_60s: 'Kode Anda valid selama 60 detik',
error_already_connected: '⚠️ Nomor {number} sudah terhubung',
error_owner_only: '❌ Perintah ini khusus untuk pemilik bot',
dellink_disconnecting: '⏳ Memutuskan {number}...',
dellink_deleting_inactive: '🗑️ Menghapus sesi tidak aktif {number}...',
dellink_success: '✅ Sesi {number} berhasil diputuskan',
dellink_deleted: '✅ Sesi {number} berhasil dihapus',
    }
};

/**
 * Obtenir une traduction
 * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
 * @param {string} key - Clé de traduction
 * @param {object} userConfigManager - Instance du gestionnaire de config
 * @returns {string} - Texte traduit
 */
function t(phoneNumber, key, userConfigManager) {
    if (!userConfigManager) {
        console.warn('userConfigManager non fourni, utilisation du français par défaut');
        return translations.fr[key] || key;
    }
    
    const config = userConfigManager.getUserConfig(phoneNumber);
    const lang = config.language || 'fr';
    
    return translations[lang]?.[key] || translations.fr[key] || key;
}

/**
 * Obtenir toutes les traductions pour une langue
 * @param {string} lang - Code langue (fr/en)
 * @returns {object} - Objet de traductions
 */
function getTranslations(lang = 'fr') {
    return translations[lang] || translations.fr;
}

export { 
    translations,
    t,
    getTranslations
 };