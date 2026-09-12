package com.sentinelsoc.agent;

import com.sentinelsoc.agent.model.LogEntry;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class LogAgent {
    private static final AtomicBoolean running = new AtomicBoolean(true);

    public static void main(String[] args) {
        String apiUrl = "http://localhost:5000/api/logs";
        long interval = 1500;
        boolean burstMode = false;

        for (int i = 0; i < args.length; i++) {
            if ("--api-url".equals(args[i]) && i + 1 < args.length) {
                apiUrl = args[++i];
            } else if ("--interval".equals(args[i]) && i + 1 < args.length) {
                interval = Long.parseLong(args[++i]);
            } else if ("--burst-mode".equals(args[i])) {
                burstMode = true;
            }
        }

        System.out.println("Starting SentinelSOC Log Agent...");
        System.out.println("API URL: " + apiUrl);
        System.out.println("Interval: " + interval + "ms");
        System.out.println("Burst Mode: " + burstMode);

        SimulatedLogGenerator generator = new SimulatedLogGenerator();
        LogSender sender = new LogSender(apiUrl);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down Log Agent...");
            running.set(false);
        }));

        int sent = 0;
        int failed = 0;

        while (running.get()) {
            LogEntry entry = generator.generateNext();
            boolean success = sender.sendLog(entry);
            
            if (success) {
                sent++;
            } else {
                failed++;
            }

            if ((sent + failed) % 50 == 0) {
                System.out.println("\n--- Agent Stats ---");
                System.out.println("Total Sent: " + sent);
                System.out.println("Total Failed: " + failed);
                Map<String, Integer> stats = generator.getStats();
                System.out.println("Brute Force Sequences: " + stats.get("bruteForce"));
                System.out.println("Impossible Travel Sequences: " + stats.get("impossibleTravel"));
                System.out.println("Privilege Escalation Sequences: " + stats.get("privilegeEscalation"));
                System.out.println("-------------------\n");
            }

            try {
                long sleepTime = burstMode ? (interval / 5) : interval;
                Thread.sleep(sleepTime);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
