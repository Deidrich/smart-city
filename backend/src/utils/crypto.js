const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Generate a cryptographically strong 32-byte key from database password or fallback string
const SECRET_KEY = crypto.scryptSync(process.env.DB_PASSWORD || 'smartcity-medan-secure-key-32chars', 'salt', 32);
const IV = Buffer.alloc(16, 0); // Static IV for consistent output in migration syncs

const encrypt = (text) => {
  try {
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error.message);
    return text;
  }
};

const decrypt = (text) => {
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, IV);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, it might be unencrypted plain text
    return text;
  }
};

module.exports = { encrypt, decrypt };
