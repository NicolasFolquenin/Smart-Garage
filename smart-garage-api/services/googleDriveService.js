const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
        this.isInitialized = false;
        this.initError = null;

        this.init();
    }

    init() {
        try {
            const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
            const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

            let auth = null;

            // Opção 1: Arquivo JSON de credenciais
            if (credentialsPath && fs.existsSync(credentialsPath)) {
                auth = new google.auth.GoogleAuth({
                    keyFile: credentialsPath,
                    scopes: ['https://www.googleapis.com/auth/drive.file']
                });
            } 
            // Opção 2: Variáveis diretas de Service Account
            else if (clientEmail && privateKey) {
                // Trata as quebras de linha que podem vir escapadas como \n no .env
                const formattedKey = privateKey.replace(/\\n/g, '\n');
                auth = new google.auth.JWT(
                    clientEmail,
                    null,
                    formattedKey,
                    ['https://www.googleapis.com/auth/drive.file']
                );
            }

            if (auth && folderId) {
                this.drive = google.drive({ version: 'v3', auth });
                this.folderId = folderId;
                this.isInitialized = true;
                this.initError = null;
            } else {
                this.isInitialized = false;
                this.initError = 'Credenciais ou GOOGLE_DRIVE_FOLDER_ID não configurados no ambiente.';
            }
        } catch (error) {
            this.isInitialized = false;
            this.initError = error.message;
            console.warn('[Google Drive] Não foi possível inicializar:', error.message);
        }
    }

    getStatus() {
        // Tenta re-inicializar caso variáveis tenham sido carregadas posteriormente
        if (!this.isInitialized) {
            this.init();
        }

        return {
            configured: this.isInitialized,
            folderId: this.folderId || null,
            message: this.isInitialized 
                ? 'Google Drive configurado e pronto.' 
                : (this.initError || 'Google Drive não configurado no .env')
        };
    }

    async testConnection() {
        if (!this.isInitialized) {
            this.init();
            if (!this.isInitialized) {
                return { connected: false, message: this.initError || 'Google Drive não configurado' };
            }
        }

        try {
            const res = await this.drive.files.get({
                fileId: this.folderId,
                fields: 'id, name'
            });

            return {
                connected: true,
                folderName: res.data.name,
                folderId: res.data.id
            };
        } catch (error) {
            return {
                connected: false,
                message: `Falha ao acessar pasta no Google Drive: ${error.message}`
            };
        }
    }

    /**
     * Faz upload de um arquivo para o Google Drive
     * @param {string} filePath Caminho absoluto do arquivo no disco
     * @param {string} fileName Nome de exibição do arquivo no Google Drive
     * @returns {Promise<{ id: string, name: string, webViewLink: string }>}
     */
    async uploadFile(filePath, fileName) {
        if (!this.isInitialized) {
            this.init();
            if (!this.isInitialized) {
                throw new Error('Google Drive não está configurado.');
            }
        }

        const fileMetadata = {
            name: fileName,
            parents: [this.folderId]
        };

        const media = {
            mimeType: 'application/zip',
            body: fs.createReadStream(filePath)
        };

        const response = await this.drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });

        return response.data;
    }

    /**
     * Remove um arquivo do Google Drive
     * @param {string} fileId 
     */
    async deleteFile(fileId) {
        if (!this.isInitialized) return;
        try {
            await this.drive.files.delete({ fileId });
        } catch (error) {
            console.warn(`[Google Drive] Erro ao deletar arquivo ${fileId}:`, error.message);
        }
    }
}

module.exports = new GoogleDriveService();
