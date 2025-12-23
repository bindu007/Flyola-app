import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Paths
const distPath = path.join(__dirname, 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static front-end build
app.use(express.static(distPath));

// Initialize Firebase
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Health check / root serve
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// CREATE - Add data to Firestore
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const docRef = await db.collection('users').add({
      name,
      email,
      createdAt: new Date(),
    });
    res.json({ id: docRef.id, message: 'User created!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get all data from Firestore
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update data in Firestore
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    await db.collection('users').doc(id).update({
      name,
      email,
      updatedAt: new Date(),
    });
    res.json({ message: 'User updated!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete data from Firestore
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    res.json({ message: 'User deleted!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all to support client-side routing (excluding API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
