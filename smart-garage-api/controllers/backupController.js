const fs = require('fs');
const path = require('path');
const backupService = require('../services/backupService');
const googleDriveService = require('../services/googleDriveService');

class BackupController {
    /**
     * Retorna o status geral de backups e conexão com o Google Drive
     */
    async getStatus(req, res) {
        try {
            const driveStatus = googleDriveService.getStatus();
            let driveConnection = { connected: false };

            if (driveStatus.configured) {
                driveConnection = await googleDriveService.testConnection();
            }

            return res.status(200).json({
                googleDrive: {
                    ...driveStatus,
                    ...driveConnection
                }
            });
        } catch (error) {
            console.error('[BackupController] Erro ao obter status:', error);
            return res.status(500).json({ mensagem: 'Erro ao verificar status dos backups.', erro: error.message });
        }
    }

    /**
     * Lista todos os backups armazenados
     */
    async listar(req, res) {
        try {
            const backups = await backupService.listarBackups();
            return res.status(200).json(backups);
        } catch (error) {
            console.error('[BackupController] Erro ao listar backups:', error);
            return res.status(500).json({ mensagem: 'Erro ao listar backups.', erro: error.message });
        }
    }

    /**
     * Cria um novo backup
     */
    async criar(req, res) {
        try {
            const resultado = await backupService.criarBackup();
            return res.status(201).json({
                mensagem: 'Backup criado com sucesso!',
                backup: resultado
            });
        } catch (error) {
            console.error('[BackupController] Erro ao criar backup:', error);
            return res.status(500).json({ mensagem: 'Erro ao gerar backup.', erro: error.message });
        }
    }

    /**
     * Baixa um arquivo de backup
     */
    async download(req, res) {
        try {
            const { filename } = req.params;
            const filePath = backupService.obterCaminhoBackup(filename);
            return res.download(filePath, filename);
        } catch (error) {
            console.error('[BackupController] Erro ao baixar backup:', error);
            return res.status(404).json({ mensagem: error.message || 'Arquivo não encontrado.' });
        }
    }

    /**
     * Exclui um backup
     */
    async excluir(req, res) {
        try {
            const { filename } = req.params;
            const resultado = await backupService.excluirBackup(filename);
            return res.status(200).json(resultado);
        } catch (error) {
            console.error('[BackupController] Erro ao excluir backup:', error);
            return res.status(500).json({ mensagem: 'Erro ao excluir backup.', erro: error.message });
        }
    }

    /**
     * Restaura a partir de um backup já existente no servidor
     */
    async restaurarExistente(req, res) {
        try {
            const { filename } = req.params;
            const filePath = backupService.obterCaminhoBackup(filename);
            const resultado = await backupService.restaurarBackup(filePath);
            return res.status(200).json(resultado);
        } catch (error) {
            console.error('[BackupController] Erro ao restaurar backup:', error);
            return res.status(500).json({ mensagem: 'Falha ao restaurar backup.', erro: error.message });
        }
    }

    /**
     * Restaura a partir de um arquivo .zip enviado pelo usuário (Upload)
     */
    async uploadERestaurar(req, res) {
        if (!req.file) {
            return res.status(400).json({ mensagem: 'Nenhum arquivo enviado.' });
        }

        const uploadedPath = req.file.path;

        try {
            const resultado = await backupService.restaurarBackup(uploadedPath);
            return res.status(200).json(resultado);
        } catch (error) {
            console.error('[BackupController] Erro na restauração por upload:', error);
            return res.status(500).json({ mensagem: 'Falha ao restaurar o arquivo enviado.', erro: error.message });
        } finally {
            // Remove o arquivo temporário de upload
            if (fs.existsSync(uploadedPath)) {
                try {
                    fs.unlinkSync(uploadedPath);
                } catch (e) {
                    console.warn('Erro ao remover arquivo temporário de upload:', e.message);
                }
            }
        }
    }
}

module.exports = new BackupController();
