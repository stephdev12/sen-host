import axios from 'axios';
import path from 'path';
import lang from '../lib/languageManager.js';

export async function updateCommand(sock, chatId, message, args) {
    try {
        await sock.sendMessage(chatId, { text: lang.t('update.updating') }, { quoted: message });

        // Le bot tourne dans /instances/<id>, donc le nom du dossier est l'ID
        const botId = path.basename(process.cwd());
        const apiUrl = `http://localhost:3005/api/bots/${botId}/upgrade`;

        // Clé interne définie dans l'API
        const INTERNAL_KEY = 'sen-bot-internal-key';

        const { data } = await axios.post(apiUrl, {}, {
            headers: {
                'x-bot-auth': INTERNAL_KEY
            }
        });

        if (data.success) {
            await sock.sendMessage(chatId, { text: lang.t('update.success') }, { quoted: message });
            // Pas besoin de process.exit(), l'API a déjà killé et relancé le processus via PM2/ChildProcess
        } else {
            throw new Error(data.error || 'Erreur inconnue');
        }

    } catch (err) {
        console.error('Update Command Error:', err);
        await sock.sendMessage(chatId, { 
            text: lang.t('update.failed') + '\n' + (err.response?.data?.error || err.message) 
        }, { quoted: message });
    }
}
