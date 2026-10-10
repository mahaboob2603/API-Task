import admin from 'firebase-admin';

// Check if Firebase is configured, otherwise mock it for development
const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID;

if (hasFirebaseConfig) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('🔥 Firebase Admin initialized');
} else {
  console.log('⚠️ Firebase config missing. Using mock authentication for development.');
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // MOCK AUTHENTICATION for dev if no firebase config
  if (!hasFirebaseConfig) {
    if (token === 'mock-token-123') {
      req.user = { uid: 'mock-user-123', email: 'test@example.com' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid mock token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
