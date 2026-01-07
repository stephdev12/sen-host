import fs from 'fs';
import path from 'path';

const SUDO_DIR = path.join(process.cwd(), 'data', 'sudo');
const SUDO_FILE = path.join(SUDO_DIR, 'sudo_users.json');

class SudoManager {
    constructor() {
        this.setupSudoDirectory();
        this.sudoUsers = this.loadSudoUsers();
    }
    
    setupSudoDirectory() {
        if (!fs.existsSync(SUDO_DIR)) {
            fs.mkdirSync(SUDO_DIR, { recursive: true });
        }
    }
    
    loadSudoUsers() {
        try {
            if (!fs.existsSync(SUDO_FILE)) {
                fs.writeFileSync(SUDO_FILE, JSON.stringify({}, null, 2));
                return {};
            }
            
            const data = fs.readFileSync(SUDO_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading sudo users:', error);
            return {};
        }
    }
    
    saveSudoUsers() {
        try {
            fs.writeFileSync(SUDO_FILE, JSON.stringify(this.sudoUsers, null, 2));
        } catch (error) {
            console.error('Error saving sudo users:', error);
        }
    }
    
    addSudoUser(phoneNumber, targetUserJid) {
        if (!this.sudoUsers[phoneNumber]) {
            this.sudoUsers[phoneNumber] = [];
        }
        
        if (!this.sudoUsers[phoneNumber].includes(targetUserJid)) {
            this.sudoUsers[phoneNumber].push(targetUserJid);
            this.saveSudoUsers();
            return true;
        }
        return false;
    }
    
    removeSudoUser(phoneNumber, targetUserJid) {
        if (!this.sudoUsers[phoneNumber]) {
            return false;
        }
        
        const index = this.sudoUsers[phoneNumber].indexOf(targetUserJid);
        if (index !== -1) {
            this.sudoUsers[phoneNumber].splice(index, 1);
            this.saveSudoUsers();
            
            if (this.sudoUsers[phoneNumber].length === 0) {
                delete this.sudoUsers[phoneNumber];
            }
            return true;
        }
        return false;
    }
    
    isSudoUser(phoneNumber, userJid) {
        if (!this.sudoUsers[phoneNumber]) {
            return false;
        }
        
        return this.sudoUsers[phoneNumber].includes(userJid);
    }
    
    getSudoUsers(phoneNumber) {
        return this.sudoUsers[phoneNumber] || [];
    }
    
    clearAllSudoUsers(phoneNumber) {
        if (this.sudoUsers[phoneNumber]) {
            delete this.sudoUsers[phoneNumber];
            this.saveSudoUsers();
            return true;
        }
        return false;
    }
}

const sudoManager = new SudoManager();
export default sudoManager;