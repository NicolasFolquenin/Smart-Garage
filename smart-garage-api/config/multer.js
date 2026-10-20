const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `img_${uniqueSuffix}${ext}`);
    }
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Formato de arquivo inválido. Permitido apenas imagens (JPEG, PNG, WebP)."));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por foto
    },
    fileFilter: fileFilter
});

module.exports = upload;