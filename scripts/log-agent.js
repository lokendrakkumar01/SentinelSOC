/**
 * SentinelSOC — Continuous Threat Telemetry & Attack Generator (Node.js)
 * 
 * Generates realistic enterprise traffic + periodic live attack vectors:
 * - Brute Force credential stuffing (Tor exit nodes & known scanner IPs)
 * - Impossible Travel across continents in minutes
 * - Privilege escalation & unauthorized config modifications
 * - Normal legitimate enterprise activity
 * 
 * Usage: node scripts/log-agent.js [--api-url https://sentinelsoc-server.onrender.com/api/logs]
 */

const args = process.argv.slice(2);
let customUrl = process.env.API_URL;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-url' && args[i + 1]) {
    customUrl = args[i + 1];
  }
}

const API_URL = customUrl || 'http://localhost:5000/api/logs';
const INTERVAL_MS = parseInt(process.env.LOG_INTERVAL) || 1200;

const NORMAL_USERS = [
  { username: 'john.doe', ip: '192.168.1.100' },
  { username: 'jane.smith', ip: '192.168.1.101' },
  { username: 'alice.wang', ip: '10.0.0.52' },
  { username: 'bob.kumar', ip: '10.0.0.53' },
  { username: 'carlos.ruiz', ip: '10.0.0.54' }
];

const ATTACKER_IPS = [
  { ip: '185.220.101.34', origin: 'Germany (Tor Exit)', tool: 'python-requests/2.28' },
  { ip: '45.155.205.233', origin: 'Russia (Scanner)', tool: 'Hydra/9.5' },
  { ip: '103.253.11.74', origin: 'Singapore (VPN)', tool: 'curl/8.4.0' },
  { ip: '91.134.125.17', origin: 'France (Proxy)', tool: 'Go-http-client/1.1' },
  { ip: '177.54.150.200', origin: 'Brazil (Botnet)', tool: 'Nikto/2.5.0' }
];

const NORMAL_ACTIONS = ['LOGIN_SUCCESS', 'FILE_ACCESS', 'API_ACCESS', 'LOGOUT', 'CONFIG_CHANGE'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendLog(entry) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (res.ok) {
      const isAttack = entry.status === 'FAILURE' || entry.action === 'PRIVILEGE_CHANGE';
      const tag = isAttack ? '🚨 ATTACK' : '⚡ EVENT';
      console.log(`[${tag}] ${entry.action} | ${entry.username} | ${entry.sourceIP}`);
    }
  } catch (err) {
    console.error(`[Connection Error] ${err.message}`);
  }
}

async function runBruteForceBurst() {
  const attacker = randomItem(ATTACKER_IPS);
  const targetUser = randomItem(NORMAL_USERS).username;
  const attempts = 7; // Triggers HIGH / CRITICAL threshold (>=5)

  console.log(`\n💥 [BURST] Launching Brute Force against ${targetUser} from ${attacker.origin} (${attacker.ip})...`);
  for (let i = 1; i <= attempts; i++) {
    await sendLog({
      timestamp: new Date().toISOString(),
      sourceIP: attacker.ip,
      username: targetUser,
      action: 'LOGIN_FAILED',
      status: 'FAILURE',
      userAgent: attacker.tool,
      rawMessage: `Failed authentication attempt #${i} for user ${targetUser} from ${attacker.ip}`,
      metadata: { attempt: i, vector: 'dictionary_attack' }
    });
    await sleep(200);
  }
}

async function runImpossibleTravel() {
  const user = 'alice.wang';
  console.log(`\n✈️  [BURST] Launching Impossible Travel simulation for ${user}...`);
  
  // Login 1 from Singapore
  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '103.253.11.74',
    username: user,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    rawMessage: `User ${user} signed in from Singapore branch office`
  });

  await sleep(400);

  // Login 2 from Russia (same minute)
  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '45.155.205.233',
    username: user,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/115.0',
    rawMessage: `User ${user} signed in from Moscow, Russia`
  });
}

async function runPrivilegeEscalation() {
  const user = 'carlos.ruiz';
  console.log(`\n🔑 [BURST] Privilege Escalation attempt by ${user}...`);
  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '10.0.0.54',
    username: user,
    action: 'PRIVILEGE_CHANGE',
    status: 'FAILURE',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    rawMessage: `Unauthorized privilege elevation attempt: User ${user} attempted to add account to Domain Admins group`,
    metadata: { targetGroup: 'Domain Admins', result: 'DENIED' }
  });
}

async function startAgent() {
  console.log('====================================================');
  console.log('  🛡️  SentinelSOC Real-Time Telemetry Generator');
  console.log('====================================================');
  console.log(`  Target API:  ${API_URL}`);
  console.log(`  Interval:    ${INTERVAL_MS}ms`);
  console.log('  Mode:        Normal Traffic + Live Cyber Attacks\n');

  let tick = 0;

  while (true) {
    tick++;

    // Every 8 ticks -> Brute force burst
    if (tick % 8 === 0) {
      await runBruteForceBurst();
    } 
    // Every 15 ticks -> Impossible travel
    else if (tick % 15 === 0) {
      await runImpossibleTravel();
    }
    // Every 22 ticks -> Privilege escalation
    else if (tick % 22 === 0) {
      await runPrivilegeEscalation();
    } 
    // Normal enterprise event
    else {
      const user = randomItem(NORMAL_USERS);
      const action = randomItem(NORMAL_ACTIONS);
      await sendLog({
        timestamp: new Date().toISOString(),
        sourceIP: user.ip,
        username: user.username,
        action,
        status: 'SUCCESS',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        rawMessage: `Routine event: ${action} executed by ${user.username}`
      });
    }

    await sleep(INTERVAL_MS);
  }
}

startAgent();
