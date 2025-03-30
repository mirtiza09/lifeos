import fs from 'fs';
import path from 'path';

// Helper function to read settings from file or create defaults
async function readSettings() {
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    
    if (fs.existsSync(settingsPath)) {
      const data = await fs.promises.readFile(settingsPath, 'utf8');
      return JSON.parse(data);
    } else {
      // Default settings
      const defaultSettings = {
        dayStartTime: "04:00" // Default to 4:00 AM
      };
      
      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        await fs.promises.mkdir(dataDir, { recursive: true });
      }
      
      // Write default settings
      await fs.promises.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error reading settings:', error);
    return { dayStartTime: "04:00" }; // Fallback default
  }
}

// Helper function to write settings to file
async function writeSettings(settings) {
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

export default async function handler(req, res) {
  try {
    // GET request - return the current day start time
    if (req.method === 'GET') {
      const settings = await readSettings();
      return res.json({ dayStartTime: settings.dayStartTime });
    }
    
    // POST request - update the day start time
    if (req.method === 'POST') {
      const { dayStartTime } = req.body;
      
      // Validate time format (HH:MM)
      const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timePattern.test(dayStartTime)) {
        return res.status(400).json({ 
          message: "Invalid time format. Please provide time in HH:MM format (24-hour)" 
        });
      }
      
      // Read existing settings
      const settings = await readSettings();
      
      // Update day start time
      settings.dayStartTime = dayStartTime;
      
      // Write updated settings
      const success = await writeSettings(settings);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to save settings" });
      }
      
      // Update environment variable for the current process
      process.env.DAY_START_TIME = dayStartTime;
      
      return res.json({ 
        message: "Day start time updated successfully", 
        dayStartTime 
      });
    }
    
    // Any other HTTP method is not allowed
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error('Error handling day-start-time request:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}