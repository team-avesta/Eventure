const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db/db.json');
const middlewares = jsonServer.defaults();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/screenshots');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Use default middlewares (cors, static, etc)
server.use(middlewares);

// Parse JSON bodies
server.use(jsonServer.bodyParser);

// Handle screenshot upload
server.post('/screenshots', upload.single('file'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(req.body);

  // Create screenshot record
  req.body = {
    id: Date.now().toString(),
    name: req.body.name || file.originalname,
    path: `/screenshots/${file.filename}`,
    uploadedAt: req.body.uploadedAt || new Date().toISOString(),
    pageName: req.body.pageName,
  };

  next();
});

// Delete file when screenshot is deleted
server.delete('/screenshots/:id', (req, res, next) => {
  const db = router.db;
  const screenshot = db.get('screenshots').find({ id: req.params.id }).value();

  if (screenshot) {
    const filePath = path.join(__dirname, '../public', screenshot.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  next();
});

// Use default router
server.use(router);

// Start server
const port = 3001;
server.listen(port, () => {
  console.log(`JSON Server with file upload is running on port ${port}`);
});
