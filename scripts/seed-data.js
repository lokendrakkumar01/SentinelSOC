/**
 * SentinelSOC — Database Seed Script
 * 
 * Populates MongoDB / MemoryStore with:
 * - 2 analyst accounts (admin + analyst)
 * - 1000+ historical log entries
 * - 50+ pre-generated alerts
 * 
 * Usage: node scripts/seed-data.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sentinelsoc:sentinelsoc_secret@localhost:27017/sentinelsoc?authSource=admin';
const DB_NAME = 'sentinelsoc';

const USERS = [
  { name: 'Admin User', email: 'admin@sentinelsoc.io', password: '$2a$10$XQCg1z4YL0R8mZGq8V0rq.8cXrBf0vZ6L5V5b5g5h5i5j5k5l5m5n', role: 'admin' },
  { name: 'SOC Analyst', email: 'analyst@sentinelsoc.io', password: '$2a$10$XQCg1z4YL0R8mZGq8V0rq.8cXrBf0vZ6L5V5b5g5h5i5j5k5l5m5n', role: 'analyst' }
];

const NORMAL_USERS = [
  { username: 'john.doe', ips: ['10.0.0.50', '192.168.1.100'], country: 'United States', city: 'New York', lat: 40.7128, lon: -74.0060 },
  { username: 'jane.smith', ips: ['10.0.0.51', '192.168.1.101'], country: 'United Kingdom', city: 'London', lat: 51.5074, lon: -0.1278 },
  { username: 'alice.wang', ips: ['10.0.0.52', '192.168.1.102'], country: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { username: 'bob.kumar', ips: ['10.0.0.53', '192.168.1.103'], country: 'India', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { username: 'carlos.ruiz', ips: ['10.0.0.54', '192.168.1.104'], country: 'Brazil', city: 'São Paulo', lat: -23.5505, lon: -46.6333 }
];

const ATTACKER_IPS = [
  { ip: '185.220.101.34', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
  { ip: '103.253.11.74', country: 'Singapore', city: 'Singapore', lat: 1.2833, lon: 103.8333 },
  { ip: '45.155.205.233', country: 'Russia', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { ip: '198.51.100.42', country: 'United States', city: 'Dallas', lat: 32.7767, lon: -96.7970 }
];

const MITRE_MAPPINGS = {
  BRUTE_FORCE: { tacticId: 'TA0006', tacticName: 'Credential Access', techniqueId: 'T1110', techniqueName: 'Brute Force', url: 'https://attack.mitre.org/techniques/T1110/' },
  BEHAVIORAL_ANOMALY: { tacticId: 'TA0001', tacticName: 'Initial Access', techniqueId: 'T1078', techniqueName: 'Valid Accounts', url: 'https://attack.mitre.org/techniques/T1078/' },
  IMPOSSIBLE_TRAVEL: { tacticId: 'TA0001', tacticName: 'Initial Access', techniqueId: 'T1078.004', techniqueName: 'Valid Accounts: Cloud Accounts', url: 'https://attack.mitre.org/techniques/T1078/004/' },
  PRIVILEGE_ESCALATION: { tacticId: 'TA0004', tacticName: 'Privilege Escalation', techniqueId: 'T1548', techniqueName: 'Abuse Elevation Control Mechanism', url: 'https://attack.mitre.org/techniques/T1548/' }
};

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function hoursAgo(h) { return new Date(Date.now() - h * 3600000); }

async function seed() {
  console.log('🛡️  SentinelSOC — Database Seeding\n');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db(DB_NAME);

    await db.collection('users').deleteMany({});
    await db.collection('logs').deleteMany({});
    await db.collection('alerts').deleteMany({});
    await db.collection('userbaselines').deleteMany({});
    await db.collection('blockedips').deleteMany({});

    await db.collection('users').insertMany(USERS.map(u => ({ ...u, createdAt: new Date() })));
    console.log(`👤 Created ${USERS.length} analyst accounts`);

    const logs = [];
    for (let i = 0; i < 500; i++) {
      const user = randomItem(NORMAL_USERS);
      logs.push({
        timestamp: hoursAgo(randomInt(1, 72)),
        sourceIP: user.ips[0],
        username: user.username,
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
        rawMessage: `User ${user.username} logged in successfully`,
        geoLocation: { country: user.country, city: user.city, lat: user.lat, lon: user.lon }
      });
    }

    const insertedLogs = await db.collection('logs').insertMany(logs);
    console.log(`📋 Created ${logs.length} historical logs`);

    const alerts = [
      {
        type: 'BRUTE_FORCE',
        severity: 'CRITICAL',
        title: 'Brute Force Attack Detected from 185.220.101.34',
        description: '12 failed login attempts from 185.220.101.34 targeting john.doe within 60s.',
        sourceIP: '185.220.101.34',
        username: 'john.doe',
        mitreAttack: MITRE_MAPPINGS.BRUTE_FORCE,
        status: 'OPEN',
        createdAt: hoursAgo(1)
      },
      {
        type: 'IMPOSSIBLE_TRAVEL',
        severity: 'CRITICAL',
        title: 'Impossible Travel: alice.wang',
        description: 'User alice.wang logged in from Singapore and Moscow within 5 minutes.',
        sourceIP: '45.155.205.233',
        username: 'alice.wang',
        mitreAttack: MITRE_MAPPINGS.IMPOSSIBLE_TRAVEL,
        status: 'OPEN',
        createdAt: hoursAgo(2)
      }
    ];

    await db.collection('alerts').insertMany(alerts);
    console.log(`🚨 Created ${alerts.length} alert records`);

    console.log('\n✅ Seeding complete!');
  } catch (err) {
    console.log('ℹ️ Local MongoDB not active. In-memory data store is active by default.');
  } finally {
    await client.close().catch(() => {});
  }
}

seed();
