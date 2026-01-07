/**
 * 𝗦𝗘𝗡 Bot - Sudo Manager
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';

const SUDO_FILE = './data/sudo.json';

class SudoManager {
    constructor() {
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(SUDO_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(SUDO_FILE)) {
            fs.writeFileSync(SUDO_FILE, JSON.stringify({ users: [] }, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(SUDO_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading sudo file:', error);
            return { users: [] };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(SUDO_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing sudo file:', error);
        }
    }

    /**
     * Ajoute un utilisateur sudo
     */
    addSudoUser(phoneNumber, jid) {
        const data = this.readData();
        const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        // Vérifier si déjà sudo
        const exists = data.users.find(u => u.phone === normalizedPhone);
        if (exists) {
            return { success: false, message: 'User is already a sudo user' };
        }

        data.users.push({
            phone: normalizedPhone,
            jid: jid,
            addedAt: new Date().toISOString()
        });

        this.writeData(data);
        return { success: true, message: 'User added as sudo successfully' };
    }

    /**
     * Retire un utilisateur sudo
     */
    removeSudoUser(phoneNumber) {
        const data = this.readData();
        const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        const initialLength = data.users.length;
        data.users = data.users.filter(u => u.phone !== normalizedPhone);

        if (data.users.length === initialLength) {
            return { success: false, message: 'User is not a sudo user' };
        }

        this.writeData(data);
        return { success: true, message: 'User removed from sudo successfully' };
    }

    /**
     * Vérifie si un utilisateur est sudo
     */
    isSudoUser(phoneNumber, jid) {
        const data = this.readData();
        const normalizedPhone = phoneNumber?.replace(/[^0-9]/g, '');
        
        return data.users.some(u => 
            u.phone === normalizedPhone || u.jid === jid
        );
    }

    /**
     * Liste tous les utilisateurs sudo
     */
    listSudoUsers() {
        const data = this.readData();
        return data.users;
    }

    /**
     * Compte le nombre d'utilisateurs sudo
     */
    countSudoUsers() {
        const data = this.readData();
        return data.users.length;
    }
}

export default new SudoManager();