package com.sentinelsoc.agent;

import com.sentinelsoc.agent.model.LogEntry;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class SimulatedLogGenerator {
    private static final String[] ACTIONS = {"LOGIN_SUCCESS", "LOGIN_FAILED", "FILE_ACCESS", "PRIVILEGE_CHANGE", "LOGOUT", "API_ACCESS", "CONFIG_CHANGE"};
    private static final String[] USER_AGENTS = {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    };
    private static final String[] SUSPICIOUS_AGENTS = {
        "python-requests/2.28", "curl/7.88", "Go-http-client/1.1", "Nmap Scripting Engine"
    };

    private static class UserProfile {
        String username;
        String[] ips;
        int startHour;
        int endHour;
        String location;

        UserProfile(String username, String ip1, String ip2, int startHour, int endHour, String location) {
            this.username = username;
            this.ips = new String[]{ip1, ip2};
            this.startHour = startHour;
            this.endHour = endHour;
            this.location = location;
        }
    }

    private final List<UserProfile> users = Arrays.asList(
        new UserProfile("john.doe", "192.168.1.100", "10.0.0.50", 9, 18, "US"),
        new UserProfile("jane.smith", "192.168.1.101", "10.0.0.51", 8, 17, "UK"),
        new UserProfile("alice.wang", "192.168.1.102", "10.0.0.52", 9, 18, "SG"),
        new UserProfile("bob.kumar", "192.168.1.103", "10.0.0.53", 10, 19, "IN"),
        new UserProfile("carlos.ruiz", "192.168.1.104", "10.0.0.54", 9, 18, "BR")
    );

    private final String[] attackerIps = {
        "185.220.101.34", "103.253.11.74", "45.155.205.233", "198.51.100.42",
        "203.0.113.88", "41.231.53.14", "177.54.150.200", "91.134.125.17"
    };

    private final Random random = new Random();
    
    private Queue<LogEntry> eventQueue = new LinkedList<>();
    
    private int bruteForceCount = 0;
    private int impossibleTravelCount = 0;
    private int privilegeEscalationCount = 0;
    private int totalGenerated = 0;
    
    public LogEntry generateNext() {
        totalGenerated++;
        
        if (!eventQueue.isEmpty()) {
            return eventQueue.poll();
        }

        int r = random.nextInt(100);
        if (r < 70) {
            return generateNormalEvent();
        } else if (r < 85) {
            generateBruteForceSequence();
        } else if (r < 93) {
            generateImpossibleTravelSequence();
        } else if (r < 98) {
            return generateOffHoursLogin();
        } else {
            generatePrivilegeEscalationSequence();
        }
        
        return eventQueue.isEmpty() ? generateNormalEvent() : eventQueue.poll();
    }
    
    private UserProfile getRandomUser() {
        return users.get(random.nextInt(users.size()));
    }
    
    private String getRandomAttackerIp() {
        return attackerIps[random.nextInt(attackerIps.size())];
    }
    
    private String getRandomUserAgent(boolean isSuspicious) {
        if (isSuspicious) return SUSPICIOUS_AGENTS[random.nextInt(SUSPICIOUS_AGENTS.length)];
        return USER_AGENTS[random.nextInt(USER_AGENTS.length)];
    }
    
    private String getTimestamp(Instant instant) {
        return DateTimeFormatter.ISO_INSTANT.format(instant);
    }
    
    private LogEntry createBaseEntry(String user, String ip, String action, String status, String userAgent, Instant time) {
        LogEntry entry = new LogEntry();
        entry.setTimestamp(getTimestamp(time));
        entry.setUsername(user);
        entry.setSourceIP(ip);
        entry.setAction(action);
        entry.setStatus(status);
        entry.setUserAgent(userAgent);
        entry.setRawMessage(String.format("[%s] [%s] [%s] user=%s ip=%s msg=\"System action recorded\"", entry.getTimestamp(), action, status, user, ip));
        return entry;
    }

    private LogEntry generateNormalEvent() {
        UserProfile user = getRandomUser();
        String ip = user.ips[random.nextInt(user.ips.length)];
        String[] normalActions = {"LOGIN_SUCCESS", "FILE_ACCESS", "LOGOUT", "API_ACCESS"};
        String action = normalActions[random.nextInt(normalActions.length)];
        
        LogEntry entry = createBaseEntry(user.username, ip, action, "SUCCESS", getRandomUserAgent(false), Instant.now());
        entry.setRawMessage(String.format("User %s performed %s from %s", user.username, action, ip));
        return entry;
    }

    private void generateBruteForceSequence() {
        bruteForceCount++;
        UserProfile user = getRandomUser();
        String attackerIp = getRandomAttackerIp();
        String userAgent = getRandomUserAgent(true);
        Instant now = Instant.now();
        
        int failures = 5 + random.nextInt(11); // 5 to 15
        for (int i = 0; i < failures; i++) {
            LogEntry fail = createBaseEntry(user.username, attackerIp, "LOGIN_FAILED", "FAILURE", userAgent, now.plusSeconds(i * 2L));
            fail.setRawMessage(String.format("Failed login attempt for %s from %s", user.username, attackerIp));
            eventQueue.add(fail);
        }
        
        if (random.nextBoolean()) {
            LogEntry success = createBaseEntry(user.username, attackerIp, "LOGIN_SUCCESS", "SUCCESS", userAgent, now.plusSeconds(failures * 2L + 2));
            success.setRawMessage(String.format("Successful login for %s from %s after multiple failures", user.username, attackerIp));
            eventQueue.add(success);
        }
    }

    private void generateImpossibleTravelSequence() {
        impossibleTravelCount++;
        UserProfile user = getRandomUser();
        String normalIp = user.ips[0];
        String remoteIp = getRandomAttackerIp();
        Instant now = Instant.now();
        
        LogEntry normalLogin = createBaseEntry(user.username, normalIp, "LOGIN_SUCCESS", "SUCCESS", getRandomUserAgent(false), now);
        eventQueue.add(normalLogin);
        
        // 3-8 minutes later
        int delaySeconds = 180 + random.nextInt(300);
        LogEntry remoteLogin = createBaseEntry(user.username, remoteIp, "LOGIN_SUCCESS", "SUCCESS", getRandomUserAgent(false), now.plusSeconds(delaySeconds));
        remoteLogin.setRawMessage(String.format("Impossible travel detected for %s. Second login from %s", user.username, remoteIp));
        eventQueue.add(remoteLogin);
    }

    private LogEntry generateOffHoursLogin() {
        UserProfile user = getRandomUser();
        String ip = user.ips[0];
        
        // Simulate 2-4 AM
        ZonedDateTime offHours = ZonedDateTime.now(ZoneId.of("UTC")).withHour(2 + random.nextInt(3)).withMinute(random.nextInt(60));
        LogEntry entry = createBaseEntry(user.username, ip, "LOGIN_SUCCESS", "SUCCESS", getRandomUserAgent(false), offHours.toInstant());
        entry.setRawMessage(String.format("Off-hours login detected for %s at %s", user.username, entry.getTimestamp()));
        return entry;
    }

    private void generatePrivilegeEscalationSequence() {
        privilegeEscalationCount++;
        UserProfile user = getRandomUser();
        String ip = user.ips[0];
        Instant now = Instant.now();
        
        LogEntry login = createBaseEntry(user.username, ip, "LOGIN_SUCCESS", "SUCCESS", getRandomUserAgent(false), now);
        eventQueue.add(login);
        
        String action = random.nextBoolean() ? "PRIVILEGE_CHANGE" : "CONFIG_CHANGE";
        String status = random.nextBoolean() ? "SUCCESS" : "FAILURE";
        LogEntry privChange = createBaseEntry(user.username, ip, action, status, getRandomUserAgent(false), now.plusSeconds(10));
        privChange.setRawMessage(String.format("User %s attempted to modify admin group membership", user.username));
        eventQueue.add(privChange);
    }
    
    public Map<String, Integer> getStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("total", totalGenerated);
        stats.put("bruteForce", bruteForceCount);
        stats.put("impossibleTravel", impossibleTravelCount);
        stats.put("privilegeEscalation", privilegeEscalationCount);
        return stats;
    }
}
