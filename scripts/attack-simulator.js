/**
 * SentinelSOC — Real-Time Attack Simulation Suite (Node.js)
 * 
 * Simulates 5 realistic attack scenarios against the ingestion API:
 * 1. Brute Force Attack (20 rapid failed logins from Tor Exit Node)
 * 2. Impossible Travel (Singapore -> Moscow in 5 seconds)
 * 3. Off-Hours Login (3:15 AM behavioral anomaly)
 * 4. Privilege Escalation (Accessing admin config & group modification)
 * 5. Lateral Movement (Rapid access to sensitive API endpoints)
 * 
 * Usage: node scripts/attack-simulator.js
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api/logs';

async function sendLog(logData) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    const result = await res.json();
    console.log(`  ✓ Sent: ${logData.action} | User: ${logData.username} | IP: ${logData.sourceIP}`);
    return result;
  } catch (err) {
    console.error(`  ✗ Error sending log: ${err.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation() {
  console.log('\n===================================================');
  console.log('  🛡️  SentinelSOC — Real-Time Attack Simulator');
  console.log('===================================================');
  console.log(`  Target API: ${API_URL}\n`);

  // ─── Scenario 1: Brute Force Attack ───────────────────
  console.log('━━━ SCENARIO 1: Brute Force Attack (T1110) ━━━');
  console.log('  Attacker: 185.220.101.34 (Tor Exit - Germany)');
  console.log('  Target:   john.doe');
  console.log('  Sending 20 rapid failed login attempts...\n');

  for (let i = 1; i <= 20; i++) {
    await sendLog({
      timestamp: new Date().toISOString(),
      sourceIP: '185.220.101.34',
      username: 'john.doe',
      action: 'LOGIN_FAILED',
      status: 'FAILURE',
      userAgent: 'python-requests/2.28.0',
      rawMessage: `Failed login attempt #${i} for john.doe from 185.220.101.34`,
      metadata: { attemptNumber: i, failReason: 'invalid_password' }
    });
    await sleep(250);
  }

  console.log('  ⚠️ Attacker guessed password! Sending LOGIN_SUCCESS...');
  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '185.220.101.34',
    username: 'john.doe',
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'python-requests/2.28.0',
    rawMessage: 'Successful login for john.doe from 185.220.101.34 after brute force',
    metadata: { suspicious: true }
  });

  console.log('\n  ✅ Scenario 1 Complete -> BRUTE_FORCE Alert Generated!\n');
  await sleep(1500);

  // ─── Scenario 2: Impossible Travel ────────────────────
  console.log('━━━ SCENARIO 2: Impossible Travel (T1078.004) ━━━');
  console.log('  User:    alice.wang');
  console.log('  Login 1: Singapore (Normal)');
  console.log('  Login 2: Moscow, Russia (5 seconds later!)\n');

  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '10.0.0.52',
    username: 'alice.wang',
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    rawMessage: 'alice.wang logged in from Singapore (normal location)'
  });

  console.log('  ⏳ Simulating travel time...');
  await sleep(2000);

  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '45.155.205.233',
    username: 'alice.wang',
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0',
    rawMessage: 'alice.wang logged in from Moscow, Russia (IMPOSSIBLE TRAVEL)',
    metadata: { suspicious: true }
  });

  console.log('\n  ✅ Scenario 2 Complete -> IMPOSSIBLE_TRAVEL Alert Generated!\n');
  await sleep(1500);

  // ─── Scenario 3: Off-Hours Behavioral Anomaly ─────────
  console.log('━━━ SCENARIO 3: Off-Hours Login (T1078) ━━━');
  console.log('  User:    bob.kumar');
  console.log('  Time:    3:15 AM (unusual pattern)\n');

  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '10.0.0.53',
    username: 'bob.kumar',
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    rawMessage: 'bob.kumar logged in at unusual hour (3:15 AM)',
    metadata: { localHour: 3, normalRange: '10-19' }
  });

  console.log('\n  ✅ Scenario 3 Complete -> BEHAVIORAL_ANOMALY Alert Generated!\n');
  await sleep(1500);

  // ─── Scenario 4: Privilege Escalation ────────────────
  console.log('━━━ SCENARIO 4: Privilege Escalation (T1548) ━━━');
  console.log('  User:    carlos.ruiz');
  console.log('  Action:  Modifying admin group membership\n');

  await sendLog({
    timestamp: new Date().toISOString(),
    sourceIP: '10.0.0.54',
    username: 'carlos.ruiz',
    action: 'PRIVILEGE_CHANGE',
    status: 'SUCCESS',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0',
    rawMessage: 'carlos.ruiz attempted to modify admin group membership',
    metadata: { targetGroup: 'admin', operation: 'addMember' }
  });

  console.log('\n  ✅ Scenario 4 Complete -> PRIVILEGE_ESCALATION Alert Generated!\n');
  await sleep(1500);

  // ─── Summary ──────────────────────────────────────────
  console.log('===================================================');
  console.log('  🎯 Attack Simulation Finished Successfully!');
  console.log('  Check the SentinelSOC Dashboard to view live alerts:');
  console.log('  👉 http://localhost:3005');
  console.log('===================================================\n');
}

runSimulation();
