#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SentinelSOC — Attack Simulator
# Triggers realistic attack scenarios against the ingestion API
# Usage: bash scripts/attack-simulator.sh [API_URL]
# ═══════════════════════════════════════════════════════════════

API_URL="${1:-http://localhost:5000/api/logs}"
DELAY="0.3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

send_log() {
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$1" > /dev/null 2>&1
  echo -e "  ${GREEN}→${NC} Sent: $(echo $1 | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f"{d[\"action\"]} | {d[\"username\"]} | {d[\"sourceIP\"]}")' 2>/dev/null || echo "$1" | head -c 80)"
}

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%S.000Z"
}

# ═══════════════════════════════════════════════════════════════
echo -e "\n${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🛡️  SentinelSOC — Attack Simulation Suite${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "  Target API: ${YELLOW}$API_URL${NC}\n"

# ─── Scenario 1: Brute Force Attack ──────────────────────
echo -e "${RED}━━━ SCENARIO 1: Brute Force Attack ━━━${NC}"
echo -e "${YELLOW}  Attacker: 185.220.101.34 (Tor Exit - Germany)${NC}"
echo -e "${YELLOW}  Target:   john.doe${NC}"
echo -e "${YELLOW}  Method:   20 rapid failed logins, then success${NC}\n"

for i in $(seq 1 20); do
  send_log "{
    \"timestamp\": \"$(timestamp)\",
    \"sourceIP\": \"185.220.101.34\",
    \"username\": \"john.doe\",
    \"action\": \"LOGIN_FAILED\",
    \"status\": \"FAILURE\",
    \"userAgent\": \"python-requests/2.28.0\",
    \"rawMessage\": \"Failed login attempt #$i for john.doe from 185.220.101.34\",
    \"metadata\": { \"failReason\": \"invalid_password\", \"attemptNumber\": $i }
  }"
  sleep $DELAY
done

# Attacker succeeds
echo -e "\n  ${RED}⚠️  Attacker guessed the password!${NC}"
send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"185.220.101.34\",
  \"username\": \"john.doe\",
  \"action\": \"LOGIN_SUCCESS\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"python-requests/2.28.0\",
  \"rawMessage\": \"Successful login for john.doe from 185.220.101.34 after brute force\",
  \"metadata\": { \"suspicious\": true }
}"

echo -e "\n${GREEN}  ✅ Scenario 1 complete — expect BRUTE_FORCE alert (T1110)${NC}\n"
sleep 2

# ─── Scenario 2: Impossible Travel ───────────────────────
echo -e "${RED}━━━ SCENARIO 2: Impossible Travel ━━━${NC}"
echo -e "${YELLOW}  User:    alice.wang${NC}"
echo -e "${YELLOW}  Login 1: Singapore (normal)${NC}"
echo -e "${YELLOW}  Login 2: Moscow, Russia (5 min later!)${NC}\n"

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"10.0.0.52\",
  \"username\": \"alice.wang\",
  \"action\": \"LOGIN_SUCCESS\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0\",
  \"rawMessage\": \"alice.wang logged in from Singapore (normal location)\",
  \"metadata\": {}
}"

echo -e "  ${YELLOW}⏳ Waiting 5 seconds (simulating 5 minutes)...${NC}"
sleep 5

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"45.155.205.233\",
  \"username\": \"alice.wang\",
  \"action\": \"LOGIN_SUCCESS\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0\",
  \"rawMessage\": \"alice.wang logged in from Moscow, Russia (IMPOSSIBLE TRAVEL)\",
  \"metadata\": { \"suspicious\": true }
}"

echo -e "\n${GREEN}  ✅ Scenario 2 complete — expect IMPOSSIBLE_TRAVEL alert (T1078.004)${NC}\n"
sleep 2

# ─── Scenario 3: Off-Hours Behavioral Anomaly ────────────
echo -e "${RED}━━━ SCENARIO 3: Off-Hours Login (Behavioral Anomaly) ━━━${NC}"
echo -e "${YELLOW}  User:    bob.kumar (normally logs in 10 AM - 7 PM IST)${NC}"
echo -e "${YELLOW}  Time:    3:15 AM (way outside normal pattern)${NC}\n"

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"10.0.0.53\",
  \"username\": \"bob.kumar\",
  \"action\": \"LOGIN_SUCCESS\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0\",
  \"rawMessage\": \"bob.kumar logged in at unusual hour (3:15 AM)\",
  \"metadata\": { \"localHour\": 3, \"normalRange\": \"10-19\" }
}"

echo -e "\n${GREEN}  ✅ Scenario 3 complete — expect BEHAVIORAL_ANOMALY alert (T1078)${NC}\n"
sleep 2

# ─── Scenario 4: Privilege Escalation ────────────────────
echo -e "${RED}━━━ SCENARIO 4: Privilege Escalation ━━━${NC}"
echo -e "${YELLOW}  User:    carlos.ruiz (regular analyst)${NC}"
echo -e "${YELLOW}  Action:  Login → Access admin panel → Modify permissions${NC}\n"

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"10.0.0.54\",
  \"username\": \"carlos.ruiz\",
  \"action\": \"LOGIN_SUCCESS\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0\",
  \"rawMessage\": \"carlos.ruiz logged in normally\",
  \"metadata\": {}
}"
sleep 1

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"10.0.0.54\",
  \"username\": \"carlos.ruiz\",
  \"action\": \"CONFIG_CHANGE\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0\",
  \"rawMessage\": \"carlos.ruiz accessed admin configuration panel\",
  \"metadata\": { \"resource\": \"/admin/config\", \"action\": \"read\" }
}"
sleep 1

send_log "{
  \"timestamp\": \"$(timestamp)\",
  \"sourceIP\": \"10.0.0.54\",
  \"username\": \"carlos.ruiz\",
  \"action\": \"PRIVILEGE_CHANGE\",
  \"status\": \"SUCCESS\",
  \"userAgent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0\",
  \"rawMessage\": \"carlos.ruiz attempted to modify admin group membership\",
  \"metadata\": { \"targetGroup\": \"admin\", \"operation\": \"addMember\" }
}"

echo -e "\n${GREEN}  ✅ Scenario 4 complete — expect PRIVILEGE_ESCALATION alert (T1548)${NC}\n"
sleep 2

# ─── Scenario 5: Lateral Movement ────────────────────────
echo -e "${RED}━━━ SCENARIO 5: Lateral Movement (Post-Compromise) ━━━${NC}"
echo -e "${YELLOW}  Attacker: Using compromised john.doe account${NC}"
echo -e "${YELLOW}  Action:   Rapid access to multiple sensitive resources${NC}\n"

RESOURCES=("/api/users/list" "/api/financial/reports" "/api/admin/secrets" "/api/db/backup" "/api/keys/ssh")
for res in "${RESOURCES[@]}"; do
  send_log "{
    \"timestamp\": \"$(timestamp)\",
    \"sourceIP\": \"185.220.101.34\",
    \"username\": \"john.doe\",
    \"action\": \"API_ACCESS\",
    \"status\": \"SUCCESS\",
    \"userAgent\": \"python-requests/2.28.0\",
    \"rawMessage\": \"john.doe accessed sensitive resource: $res\",
    \"metadata\": { \"resource\": \"$res\", \"method\": \"GET\" }
  }"
  sleep $DELAY
done

echo -e "\n${GREEN}  ✅ Scenario 5 complete — multiple API access events logged${NC}\n"

# ─── Summary ─────────────────────────────────────────────
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🎯 Attack Simulation Complete!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "  Scenarios executed:"
echo -e "    1. ${RED}Brute Force${NC}         — 21 events (T1110)"
echo -e "    2. ${RED}Impossible Travel${NC}   — 2 events  (T1078.004)"
echo -e "    3. ${YELLOW}Behavioral Anomaly${NC} — 1 event   (T1078)"
echo -e "    4. ${YELLOW}Privilege Escalation${NC}— 3 events  (T1548)"
echo -e "    5. ${RED}Lateral Movement${NC}   — 5 events  (T1021)"
echo -e "\n  ${GREEN}Check the SentinelSOC dashboard for live alerts!${NC}"
echo -e "  ${CYAN}http://localhost:3000/dashboard${NC}\n"
