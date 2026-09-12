package com.sentinelsoc.agent;

import com.sentinelsoc.agent.model.LogEntry;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LogParser {
    
    // Example format: [TIMESTAMP] [ACTION] [STATUS] user=USERNAME ip=IP msg="MESSAGE"
    private static final Pattern LOG_PATTERN = Pattern.compile(
        "\\[(.*?)\\] \\[(.*?)\\] \\[(.*?)\\] user=(.*?) ip=(.*?) msg=\"(.*?)\""
    );

    public static LogEntry parseLogLine(String rawLine) {
        if (rawLine == null) return null;
        
        Matcher matcher = LOG_PATTERN.matcher(rawLine);
        if (matcher.find()) {
            LogEntry entry = new LogEntry();
            entry.setTimestamp(matcher.group(1));
            entry.setAction(matcher.group(2));
            entry.setStatus(matcher.group(3));
            entry.setUsername(matcher.group(4));
            entry.setSourceIP(matcher.group(5));
            entry.setRawMessage(matcher.group(6));
            return entry;
        }
        return null;
    }

    public static String formatLogEntry(LogEntry entry) {
        if (entry == null) return "";
        return String.format("[%s] [%s] [%s] user=%s ip=%s msg=\"%s\"",
            entry.getTimestamp() != null ? entry.getTimestamp() : "",
            entry.getAction() != null ? entry.getAction() : "",
            entry.getStatus() != null ? entry.getStatus() : "",
            entry.getUsername() != null ? entry.getUsername() : "",
            entry.getSourceIP() != null ? entry.getSourceIP() : "",
            entry.getRawMessage() != null ? entry.getRawMessage() : ""
        );
    }
}
