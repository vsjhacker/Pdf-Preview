import express from 'express';
import path from 'path';
import multer from "multer";
import fs from "fs";
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const port = 3001; // Choose the port your server will run on

app.use(cors());

// Get the current directory path using import.meta.url
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const uploadsDir = path.join(process.cwd(), 'uploads');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname)

console.log(uploadsDir);

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory to save the uploaded files
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure the file extension is preserved
    }
  });
  
  // Set up multer with the storage engine
  const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    }
  });
  
  // Route to handle PDF file upload
  app.post('/upload-pdf', upload.single('pdf'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    // Log the file information to ensure it's saved correctly
    console.log('Uploaded file:', req.file);
  
    // Respond back with success message and file details
    res.json({
      message: 'PDF uploaded successfully',
      file: req.file
    });
  });

  // Route to get the latest uploaded PDF file based on the modification time
app.get('/latest-pdf', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read the uploads directory' });
      }
  
      // Filter to only include PDF files
      const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
  
      if (pdfFiles.length === 0) {
        return res.status(404).json({ error: 'No PDF files found' });
      }
  
      // Get the latest file based on the modification time
      const latestPdf = pdfFiles.reduce((latest, file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return stats.mtime > latest.mtime ? { filename: file, mtime: stats.mtime } : latest;
      }, { filename: '', mtime: 0 });
  
      // Serve the latest PDF file
      const filePath = path.join(uploadsDir, latestPdf.filename);
  
      // Check if the file exists before sending
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ error: 'Latest PDF not found' });
      }
    });
  });
 

  // Route to get the latest uploaded PDF file path
app.get('/latest-pdfs', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
  
    // Read the files in the uploads directory
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read uploads directory' });
      }
  
      // Filter only PDF files
      const pdfFiles = files.filter(file => path.extname(file) === '.pdf');
  
      // If no PDF files are found
      if (pdfFiles.length === 0) {
        return res.status(404).json({ error: 'No PDF files found' });
      }
  
      // Sort files by the creation time (newest first)
      const latestPdf = pdfFiles.sort((a, b) => {
        return fs.statSync(path.join(uploadsDir, b)).mtime.getTime() - fs.statSync(path.join(uploadsDir, a)).mtime.getTime();
      })[0];
  
      // Return the path of the latest PDF
      const latestPdfPath = path.join('/uploads', latestPdf); // Make it accessible via a URL
  
      res.json({
        message: 'Latest PDF file path retrieved successfully',
        filePath: latestPdfPath
      });
    });
  });
  

// Serve the React app build files
app.use(express.static(path.join('build')));

// Route to handle any API requests (optional)
app.get('/api', (req, res) => {
  res.send({ message: 'Hello from the server!' });
});

// Fallback route to handle all other requests (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


/*import express from 'express';
import path from 'path';
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from 'url';

const app = express();
const port = 3001; // Choose the port your server will run on

// Store the filename of the latest uploaded PDF
let latestPdfFile = null;

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory to save the uploaded files
    },
    filename: function (req, file, cb) {
      // Use the original file name for replacement
      const fileName = path.basename(file.originalname, path.extname(file.originalname)) + '.pdf';
      cb(null, fileName); // Ensure the file extension is preserved
    }
});

// Set up multer with the storage engine
const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Route to handle PDF file upload (replace existing file)
app.post('/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join('uploads', req.file.filename);

  // Check if the file already exists and replace it
  if (fs.existsSync(filePath)) {
    // Remove the existing file before saving the new one
    fs.unlinkSync(filePath);
  }

  // Log the file information to ensure it's saved correctly
  console.log('Uploaded file:', req.file);

  // Respond back with success message and file details
  res.json({
    message: 'PDF uploaded and replaced successfully',
    file: req.file
  });
});

// Serve the React app build files
app.use(express.static(path.join('build')));

// Route to serve the latest uploaded PDF file
app.get('/latest-pdf', (req, res) => {
    if (!latestPdfFile) {
      return res.status(404).json({ error: 'No PDF file uploaded yet' });
    }
  
    // Serve the latest uploaded PDF file
    const filePath = path.join('uploads', latestPdfFile);
  
    // Check if the file exists before sending
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Latest PDF not found' });
    }
  });

// Route to handle any API requests (optional)
app.get('/api', (req, res) => {
  res.send({ message: 'Hello from the server!' });
});

// Fallback route to handle all other requests (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
*/