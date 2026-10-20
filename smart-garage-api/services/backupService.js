const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const mysql = require('mysql2/promise');
const googleDriveService = require('./googleDriveService');

const BACKUP_DIR = path.resolve(__dirname, '..', 'backups');
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
const INDEX_FILE = path.join(BACKUP_DIR, 'index.json');

// Garante que o diretório de backups exista
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

class BackupService {
    /**
     * Lê o índice com os metadados dos backups
     */
    _loadIndex() {
        try {
            if (fs.existsSync(INDEX_FILE)) {
                const data = fs.readFileSync(INDEX_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('[Backup] Falha ao ler index.json, gerando novo:', e.message);
        }
        return {};
    }

    /**
     * Salva o índice de metadados
     */
    _saveIndex(indexData) {
        try {
            fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf8');
        } catch (e) {
            console.error('[Backup] Falha ao salvar index.json:', e.message);
        }
    }

    /**
     * Formata bytes para exibição legível (KB, MB, GB)
     */
    _formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Retorna a lista de backups disponíveis
     */
    async listarBackups() {
        const index = this._loadIndex();
        const files = fs.readdirSync(BACKUP_DIR).filter(file => file.endsWith('.zip'));

        const list = files.map(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            const meta = index[file] || {};

            return {
                filename: file,
                size: stats.size,
                sizeFormatted: this._formatBytes(stats.size),
                createdAt: meta.createdAt || stats.mtime.toISOString(),
                googleDrive: meta.googleDrive || {
                    synced: false,
                    fileId: null,
                    link: null
                }
            };
        });

        // Ordena do mais recente para o mais antigo
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return list;
    }

    /**
     * Gera um novo backup completo (Banco de Dados + Uploads)
     */
    async criarBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_smart_garage_${timestamp}.zip`;
        const zipPath = path.join(BACKUP_DIR, filename);
        const tempSqlPath = path.join(BACKUP_DIR, `temp_dump_${timestamp}.sql`);

        try {
            console.log('[Backup] Iniciando dump do banco de dados MySQL...');
            
            // 1. Gera dump MySQL
            await mysqldump({
                connection: {
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASS || '',
                    database: process.env.DB_NAME || 'smart_garage',
                    port: parseInt(process.env.DB_PORT, 10) || 3306
                },
                dumpToFile: tempSqlPath
            });

            console.log('[Backup] Dump SQL gerado. Criando arquivo compactado .zip...');

            // 2. Compacta o SQL + pasta uploads
            await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', resolve);
                archive.on('error', reject);

                archive.pipe(output);

                // Adiciona o dump do banco
                archive.file(tempSqlPath, { name: 'database.sql' });

                // Adiciona metadados
                const metadata = {
                    createdAt: new Date().toISOString(),
                    database: process.env.DB_NAME || 'smart_garage',
                    app: 'Smart Garage'
                };
                archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

                // Adiciona a pasta de uploads (se existir)
                if (fs.existsSync(UPLOADS_DIR)) {
                    archive.directory(UPLOADS_DIR, 'uploads');
                }

                archive.finalize();
            });

            // Remove o arquivo SQL temporário
            if (fs.existsSync(tempSqlPath)) {
                fs.unlinkSync(tempSqlPath);
            }

            const stats = fs.statSync(zipPath);
            console.log(`[Backup] Arquivo ZIP criado: ${filename} (${this._formatBytes(stats.size)})`);

            // 3. Tenta enviar para o Google Drive
            let googleDriveResult = { synced: false, fileId: null, link: null };
            try {
                const driveStatus = googleDriveService.getStatus();
                if (driveStatus.configured) {
                    console.log('[Backup] Enviando arquivo para o Google Drive...');
                    const driveUpload = await googleDriveService.uploadFile(zipPath, filename);
                    googleDriveResult = {
                        synced: true,
                        fileId: driveUpload.id,
                        link: driveUpload.webViewLink || null
                    };
                    console.log(`[Backup] Upload concluído no Google Drive! ID: ${driveUpload.id}`);
                }
            } catch (driveErr) {
                console.warn('[Backup] Falha ao enviar para o Google Drive (arquivo mantido localmente):', driveErr.message);
            }

            // 4. Salva no índice local
            const index = this._loadIndex();
            index[filename] = {
                createdAt: new Date().toISOString(),
                size: stats.size,
                googleDrive: googleDriveResult
            };
            this._saveIndex(index);

            return {
                filename,
                size: stats.size,
                sizeFormatted: this._formatBytes(stats.size),
                googleDrive: googleDriveResult,
                createdAt: index[filename].createdAt
            };

        } catch (error) {
            // Limpeza em caso de erro
            if (fs.existsSync(tempSqlPath)) {
                fs.unlinkSync(tempSqlPath);
            }
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }
            console.error('[Backup] Erro ao criar backup:', error);
            throw error;
        }
    }

    /**
     * Retorna o caminho de um backup existente para download
     */
    obterCaminhoBackup(filename) {
        const safeName = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, safeName);
        if (!fs.existsSync(filePath)) {
            throw new Error('Arquivo de backup não encontrado.');
        }
        return filePath;
    }

    /**
     * Exclui um backup do disco e do Google Drive (se sincronizado)
     */
    async excluirBackup(filename) {
        const safeName = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, safeName);
        const index = this._loadIndex();
        const meta = index[safeName];

        // Se estiver no Google Drive, remove de lá também
        if (meta && meta.googleDrive && meta.googleDrive.fileId) {
            try {
                await googleDriveService.deleteFile(meta.googleDrive.fileId);
            } catch (e) {
                console.warn('[Backup] Falha ao deletar do Google Drive:', e.message);
            }
        }

        // Remove do disco local
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Atualiza index
        if (index[safeName]) {
            delete index[safeName];
            this._saveIndex(index);
        }

        return { message: 'Backup excluído com sucesso.' };
    }

    /**
     * Restaura os dados a partir de um arquivo .zip de backup
     */
    async restaurarBackup(zipFilePath) {
        if (!fs.existsSync(zipFilePath)) {
            throw new Error('Arquivo de backup não encontrado.');
        }

        const tempRestoreDir = path.join(BACKUP_DIR, `temp_restore_${Date.now()}`);
        fs.mkdirSync(tempRestoreDir, { recursive: true });

        try {
            console.log('[Restauração] Descompactando arquivo de backup...');
            const zip = new AdmZip(zipFilePath);
            zip.extractAllTo(tempRestoreDir, true);

            // 1. Procura o arquivo SQL
            const sqlPath = path.join(tempRestoreDir, 'database.sql');
            if (!fs.existsSync(sqlPath)) {
                throw new Error('Arquivo database.sql não encontrado dentro do backup.');
            }

            console.log('[Restauração] Restaurando banco de dados MySQL...');
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');

            // Cria conexão direta com o MySQL permitindo múltiplas queries
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'smart_garage',
                port: parseInt(process.env.DB_PORT, 10) || 3306,
                multipleStatements: true
            });

            try {
                // Desabilita verificação de chaves estrangeiras temporariamente para restaurar sem problemas de ordem
                await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
                await connection.query(sqlContent);
                await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
            } finally {
                await connection.end();
            }

            console.log('[Restauração] Banco de dados restaurado com sucesso!');

            // 2. Restaura pasta uploads (se existir no zip)
            const extractedUploadsDir = path.join(tempRestoreDir, 'uploads');
            if (fs.existsSync(extractedUploadsDir)) {
                console.log('[Restauração] Restaurando arquivos da pasta uploads...');
                if (!fs.existsSync(UPLOADS_DIR)) {
                    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
                }

                const copyRecursive = (src, dest) => {
                    const entries = fs.readdirSync(src, { withFileTypes: true });
                    for (const entry of entries) {
                        const srcPath = path.join(src, entry.name);
                        const destPath = path.join(dest, entry.name);
                        if (entry.isDirectory()) {
                            if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
                            copyRecursive(srcPath, destPath);
                        } else {
                            fs.copyFileSync(srcPath, destPath);
                        }
                    }
                };

                copyRecursive(extractedUploadsDir, UPLOADS_DIR);
                console.log('[Restauração] Arquivos de uploads restaurados!');
            }

            return {
                sucesso: true,
                mensagem: 'Backup restaurado com sucesso! Banco de dados e arquivos foram atualizados.'
            };

        } finally {
            // Limpa a pasta temporária
            try {
                if (fs.existsSync(tempRestoreDir)) {
                    fs.rmSync(tempRestoreDir, { recursive: true, force: true });
                }
            } catch (e) {
                console.warn('[Restauração] Não foi possível remover pasta temporária:', e.message);
            }
        }
    }
}

module.exports = new BackupService();
