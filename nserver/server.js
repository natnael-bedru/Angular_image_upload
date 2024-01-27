const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080; // Use the provided port or default to 8080

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const fileDetails = {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  };

  res.status(200).json({ message: "File uploaded successfully", fileDetails });
});

app.get("/files", (req, res) => {
  const uploadsDirectory = path.join(__dirname, "uploads");

  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const fileDetails = files.map((fileName) => {
      const filePath = path.join(uploadsDirectory, fileName);
      const stats = fs.statSync(filePath);

      // Dynamically construct the URL based on the server's base URL and port
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${baseUrl}/uploads/${fileName}`;

      // Extract the file extension (type)
      const fileExtension = path.extname(fileName).toLowerCase();

      return {
        originalname: fileName,
        size: stats.size,
        url: fileUrl,
        type: fileExtension,
      };
    });

    res.json(fileDetails);
  });
});

app.listen(PORT, () => {
  console.log(`Fake server is running on http://localhost:${PORT}`);
});
