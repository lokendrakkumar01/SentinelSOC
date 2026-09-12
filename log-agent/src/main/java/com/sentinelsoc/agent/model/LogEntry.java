package com.sentinelsoc.agent.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.Map;
import java.util.HashMap;

public class LogEntry {
    private String timestamp;      // ISO 8601 format
    private String sourceIP;       // IP address
    private String username;       // e.g., "john.doe"
    private String action;         // LOGIN_SUCCESS, LOGIN_FAILED, FILE_ACCESS, PRIVILEGE_CHANGE, LOGOUT, API_ACCESS, CONFIG_CHANGE
    private String status;         // SUCCESS, FAILURE
    private String userAgent;      // Browser/client info
    private String rawMessage;     // Human-readable log line
    private Map<String, Object> metadata; // Extra data

    private static final Gson GSON = new GsonBuilder().create();

    public LogEntry() {
        this.metadata = new HashMap<>();
    }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getSourceIP() { return sourceIP; }
    public void setSourceIP(String sourceIP) { this.sourceIP = sourceIP; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getRawMessage() { return rawMessage; }
    public void setRawMessage(String rawMessage) { this.rawMessage = rawMessage; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public String toJson() {
        return GSON.toJson(this);
    }
}
