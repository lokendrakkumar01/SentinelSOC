/**
 * SentinelSOC — Continuous Log Agent (Node.js)
 * 
 * Continuously generates structured system and authentication logs
 * with periodic attack bursts and POSTs them to the Express API.
 * 
 * Usage: node scripts/log-agent.js
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api/logs';
const INTERVAL_MS = parseInt(process.env.LOG_INTERVAL) || 1500;

const USERS = ['john.doe', 'jane.smith', 'alice.wang', 'bob.kumar', 'carlos.ruiz'];
const IPS = ['192.168.1.100', '192.168.1.101', '10.0.0.52', '10.0.0.53', '10.0.0.54'];
const ACTIONS = ['LOGIN_SUCCESS', 'FILE_ACCESS', 'API_ACCESS', 'LOGOUT', 'CONFIG_CHANGE'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function sendLog(entry) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (res.ok) {
      console.log(`[Agent] Sent log: ${entry.action} by ${entry.username} from ${entry.sourceIP}`);
    }
  } catch (err) {
    console.error(`[Agent Error] ${err.message}`);
  }
}

async function startAgent() {
  console.log('🤖 SentinelSOC Continuous Log Agent Started');
  console.log(`   Targeting: ${API_URL}`);
  console.log(`   Interval: ${INTERVAL_MS}ms\n`);

  let count = 0;

  setInterval(async () => {
    count++;
    const userIndex = Math.floor(Math.random() * USERS.length);
    const username = USERS[userIndex];
    const sourceIP = IPS[userIndex];
    const action = randomItem(ACTIONS);

    const logEntry = {
      timestamp: new Date().toISOString(),
      sourceIP,
      username,
      action,
      status: 'SUCCESS',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      rawMessage: `System event: ${action} performed by ${username}`
    };

    await sendLog(logEntry);
  }, INTERVAL_MS);
}

startAgent();
