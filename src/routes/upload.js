const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📌 Define a pasta onde as imagens serão salvas
const uploadFolder = path.join(__dirname, "../public/uploads");

// 📌 Configuração do multer (middleware de upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, "logo_empresa.jpg"); // 🔥 Sempre substitui a logo anterior
  },
});

const upload = multer({ storage });

// 📌 Endpoint para upload da logo da empresa
router.post("/upload-logo", upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhuma imagem enviada" });
  }

  res.status(200).json({ message: "Imagem enviada com sucesso", filePath: `/uploads/logo_empresa.jpg` });
});

module.exports = router;
