const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const backupController = require('../controllers/backupController');
const { verifyToken, isGerente } = require('../middleware/authMiddleware');

// Configuração do multer para arquivos de backup temporários
const tempUploadDir = path.resolve(__dirname, '..', 'backups', 'temp_uploads');
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `upload_restore_${uniqueSuffix}.zip`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.zip') || file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .zip são aceitos para restauração de backup.'));
        }
    }
});

// Todas as rotas de backup são exclusivas para o perfil 'gerente'
router.use(verifyToken, isGerente);

router.get('/status', (req, res) => backupController.getStatus(req, res));
router.get('/', (req, res) => backupController.listar(req, res));
router.post('/', (req, res) => backupController.criar(req, res));
router.get('/download/:filename', (req, res) => backupController.download(req, res));
router.delete('/:filename', (req, res) => backupController.excluir(req, res));
router.post('/restaurar/:filename', (req, res) => backupController.restaurarExistente(req, res));
router.post('/upload-restaurar', upload.single('backupFile'), (req, res) => backupController.uploadERestaurar(req, res));

module.exports = router;
