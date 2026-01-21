const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

exports.upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files allowed"), false);
        }
        cb(null, true);
    }
});

exports.deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, "..", "..", filePath);

    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error(`Failed to delete file: ${fullPath}`, err);
        } else {
            console.log(`Successfully deleted file: ${fullPath}`);
        }
    });
};