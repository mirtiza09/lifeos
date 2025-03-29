// Example Vercel serverless function for day start time settings
import fs from 'fs';
import path from 'path';

// Default day start time if not set
const DEFAULT_DAY_START_TIME = '04:00';
// Path to settings file - for Vercel, we need to use /tmp for write access
const SETTINGS_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/settings.json'
  : path.join(process.cwd(), 'data', 'settings.json');

// Helper function to read settings
async function readSettings() {
  try {
    // Ensure the file exists in production
    if (process.env.NODE_ENV === 'production' && !fs.existsSync(SETTINGS_PATH)) {
      const defaultSettings = { dayStartTime: DEFAULT_DAY_START_TIME };
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2), 'utf8');
    }
    
    // Read the settings file if it exists
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
      return JSON.parse(data);
    }
    
    // Return default settings if file doesn't exist
    return { dayStartTime: DEFAULT_DAY_START_TIME };
  } catch (error) {
    console.error('Error reading settings:', error);
    return { dayStartTime: DEFAULT_DAY_START_TIME };
  }
}

// Helper function to write settings
async function writeSettings(settings) {
  try {
    // Ensure directory exists for non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const dir = path.dirname(SETTINGS_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/day-start-time - Get day start time setting
    if (req.method === 'GET') {
      const settings = await readSettings();
      res.status(200).json({ dayStartTime: settings.dayStartTime || DEFAULT_DAY_START_TIME });
    } 
    // POST /api/day-start-time - Update day start time setting
    else if (req.method === 'POST') {
      const { dayStartTime } = req.body;
      
      if (!dayStartTime || typeof dayStartTime !== 'string') {
        res.status(400).json({ message: 'Invalid day start time format' });
        return;
      }
      
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(dayStartTime)) {
        res.status(400).json({ message: 'Invalid time format. Use HH:MM format (24-hour)' });
        return;
      }
      
      // Read current settings, update and save
      const settings = await readSettings();
      settings.dayStartTime = dayStartTime;
      
      const success = await writeSettings(settings);
      if (!success) {
        res.status(500).json({ message: 'Failed to save settings' });
        return;
      }
      
      res.status(200).json({ dayStartTime });
    } 
    // Method not allowed
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}