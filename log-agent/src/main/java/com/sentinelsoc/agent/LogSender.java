package com.sentinelsoc.agent;

import com.sentinelsoc.agent.model.LogEntry;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class LogSender {
    private final String apiUrl;
    private final HttpClient client;

    public LogSender(String apiUrl) {
        this.apiUrl = apiUrl;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean sendLog(LogEntry entry) {
        String json = entry.toJson();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(5))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        int[] backoffs = {1000, 2000, 4000};
        
        for (int i = 0; i <= backoffs.length; i++) {
            try {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println("Successfully sent log entry for " + entry.getUsername());
                    return true;
                } else {
                    System.err.println("Failed to send log entry. Status code: " + response.statusCode());
                }
            } catch (Exception e) {
                System.err.println("Attempt " + (i + 1) + " failed: " + e.getMessage());
            }

            if (i < backoffs.length) {
                try {
                    Thread.sleep(backoffs[i]);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        return false;
    }
}
