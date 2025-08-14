import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cron from 'node-cron';

const app = express();
const allowedOrigins = [
  'https://ott.vpjoshi.in',
  'https://ott-test.vpjoshi.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET; 
const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL;
const VIDEOS_BASE_PATH = '/SRV/';

if (!JWT_SECRET || !AUTH_API_BASE_URL) {
    console.error("FATAL ERROR: Missing required environment variables.");
    console.error("Please provide JWT_SECRET and AUTH_API_BASE_URL.");
    process.exit(1); // Exit the process with an error code
}
const movieResources = {
    dispicable_me_4: path.join(VIDEOS_BASE_PATH, 'DM4', 'master.m3u8'),
    kung_fu_panda: path.join(VIDEOS_BASE_PATH, 'KFP', 'master.m3u8'),
    suzume: path.join(VIDEOS_BASE_PATH, 'SUZ', 'master.m3u8'),
    the_gorge: path.join(VIDEOS_BASE_PATH, 'TGE', 'master.m3u8'),
    puss_in_boots: path.join(VIDEOS_BASE_PATH, 'PIB', 'master.m3u8'),
    minions: path.join(VIDEOS_BASE_PATH, 'MRG', 'master.m3u8'),
    interstellar: path.join(VIDEOS_BASE_PATH, 'ISR', 'master.m3u8'),
    family_guy: path.join(VIDEOS_BASE_PATH, 'FGT', 'master.m3u8'),
    avengers_endgame: path.join(VIDEOS_BASE_PATH, 'AEG', 'master.m3u8'),
    deadpool_wolverine: path.join(VIDEOS_BASE_PATH, 'DPW', 'master.m3u8'),
};

const movieShortName = {
    dispicable_me_4: 'DM4',
    kung_fu_panda: 'KFP',
    suzume: 'SUZ',
    the_gorge: 'TGE',
    puss_in_boots: 'PIB',
    minions: 'MRG',
    interstellar: 'ISR',
    family_guy: 'FGT',
    avengers_endgame: 'AEG',
    deadpool_wolverine: 'DPW',
};

// --- UPDATED: Maps and Data Limits for both user types ---
const guestDataUsage = new Map(); // Tracks usage by IP for guests
const jwtDataUsage = new Map();   // Tracks usage by UserID for logged-in users

const GUEST_DATA_LIMIT_MB = 500;
const JWT_DATA_LIMIT_MB = 3000;

const GUEST_DATA_LIMIT_BYTES = GUEST_DATA_LIMIT_MB * 1024 * 1024;
const JWT_DATA_LIMIT_BYTES = JWT_DATA_LIMIT_MB * 1024 * 1024;


// --- UPDATED: Centralized Middleware for Auth and Usage Tracking ---
const trackUsage = (req, res, next) => {
    const { resourceName, segment } = req.params;

    // Playlists (.m3u8) don't count towards data usage, so we let them pass
    if (!segment.endsWith('.ts')) {
        return next();
    }

    const segmentPath = path.join(VIDEOS_BASE_PATH, movieShortName[resourceName], segment);
    if (!fs.existsSync(segmentPath)) {
        return res.status(404).send('Segment not found.');
    }
    const segmentSize = fs.statSync(segmentPath).size;

    const token = req.headers['x-auth-token'];

    // --- LOGIC FOR JWT (LOGGED-IN) USERS ---
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.userId; // Use userId from token as the unique key
            const currentUsage = jwtDataUsage.get(userId) || 0;

            if (currentUsage + segmentSize > JWT_DATA_LIMIT_BYTES) {
                console.log(`[Limit] 🚫 JWT User ${userId} has exceeded the data limit.`);
                return res.status(403).send('Data limit for your account has been reached.');
            }
            
            const newUsage = currentUsage + segmentSize;
            jwtDataUsage.set(userId, newUsage);
            console.log(`[Auth] ✅ User: ${userId} | Serving: ${segment} | Usage: ${(newUsage / 1024 / 1024).toFixed(2)}MB / ${JWT_DATA_LIMIT_MB}MB`);
            return next();

        } catch (error) {
            console.error(`[Auth] ❌ Invalid Token: ${error.message}`);
            return res.status(401).send('Unauthorized: Invalid or expired token.');
        }
    }
    
    // --- LOGIC FOR GUEST (IP-BASED) USERS ---
    const ip = req.ip;
    const currentUsage = guestDataUsage.get(ip) || 0;

    if (currentUsage + segmentSize > GUEST_DATA_LIMIT_BYTES) {
        console.log(`[Limit] 🚫 Guest IP ${ip} has exceeded the data limit.`);
        return res.status(403).send('Guest data limit exceeded. Please log in for a higher limit.');
    }

    const newUsage = currentUsage + segmentSize;
    guestDataUsage.set(ip, newUsage);
    console.log(`[Guest] 👤 IP: ${ip} | Serving: ${segment} | Usage: ${(newUsage / 1024 / 1024).toFixed(2)}MB / ${GUEST_DATA_LIMIT_MB}MB`);
    next();
};


// --- API Routes ---

// The master playlist is fetched first and is not tracked by the middleware
app.get('/stream/:resourceName/master.m3u8', (req, res) => {
    const { resourceName } = req.params;
    const masterFilePath = movieResources[resourceName];
    if (!masterFilePath || !fs.existsSync(masterFilePath)) {
        return res.status(404).send('Movie not found.');
    }
    res.sendFile(masterFilePath);
});

// --- UPDATED: Simplified route handler ---
// All the heavy lifting is now done in the `trackUsage` middleware.
app.get('/stream/:resourceName/:segment', trackUsage, (req, res) => {
    const { resourceName, segment } = req.params;
    const segmentPath = path.join(VIDEOS_BASE_PATH, movieShortName[resourceName], segment);
    
    // The middleware already checked if the file exists, but it's safe to keep it
    if (!fs.existsSync(segmentPath)) {
        return res.status(404).send('Segment not found.');
    }
    
    res.sendFile(segmentPath);
});




cron.schedule('0 0 * * *', () => {
  // Clear both usage maps
  guestDataUsage.clear();
  jwtDataUsage.clear();
  
  // Log a confirmation message to the console
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  console.log(`✅ [Scheduler] Data usage for all users has been reset at ${timestamp}`);
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


// --- Authentication Proxy Routes ---


// Proxy for the /signup endpoint
app.post('/signup', async (req, res) => {
    try {
        // Forward the client's request to the actual authentication service
        const response = await axios.post(`${AUTH_API_BASE_URL}/signup`, req.body);
        
        // Send back the response from the auth service (e.g., JWT token) to the client
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('[Auth Error] /signup:', error.response ? error.response.data : error.message);
        // Forward the error from the auth service or send a generic server error
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal server error occurred.' });
    }
});

// Proxy for the /signin endpoint
app.post('/signin', async (req, res) => {
    try {
        // Forward the client's request to the actual authentication service
        const response = await axios.post(`${AUTH_API_BASE_URL}/signin`, req.body);
        
        // Send back the response from the auth service (e.g., JWT token) to the client
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('[Auth Error] /signin:', error.response ? error.response.data : error.message);
        // Forward the error from the auth service or send a generic server error
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal server error occurred.' });
    }
});











app.listen(8080, () => {
    console.log('✅ HLS Streaming Server with Tiered Limits is running on http://localhost:8080');
});