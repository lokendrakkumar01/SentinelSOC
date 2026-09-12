import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Graticule } from 'react-simple-maps';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Default coordinates for simulated threat actors and branch offices
const KNOWN_GEO_COORDINATES: Record<string, { lat: number; lon: number; country: string }> = {
  // Attacker IPs
  '185.220.101.34': { lat: 50.1109, lon: 8.6821, country: 'Germany (Tor Exit)' },
  '45.155.205.233': { lat: 55.7558, lon: 37.6173, country: 'Russia (Threat Actor)' },
  '103.253.11.74': { lat: 1.3521, lon: 103.8198, country: 'Singapore (Proxy/VPN)' },
  '198.51.100.42': { lat: 37.7749, lon: -122.4194, country: 'United States' },
  '203.0.113.88': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
  '41.231.53.14': { lat: 36.8065, lon: 10.1815, country: 'Tunisia' },
  '177.54.150.200': { lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  '91.134.125.17': { lat: 48.8566, lon: 2.3522, country: 'France' },
  // Corporate Subnets / Users
  '10.0.0.50': { lat: 38.9072, lon: -77.0369, country: 'USA - DC HQ' },
  '192.168.1.100': { lat: 38.9072, lon: -77.0369, country: 'USA - DC HQ' },
  '10.0.0.51': { lat: 51.5074, lon: -0.1278, country: 'UK - London Office' },
  '192.168.1.101': { lat: 51.5074, lon: -0.1278, country: 'UK - London Office' },
  '10.0.0.52': { lat: 1.3521, lon: 103.8198, country: 'SG - APAC Hub' },
  '192.168.1.102': { lat: 1.3521, lon: 103.8198, country: 'SG - APAC Hub' },
  '10.0.0.53': { lat: 28.6139, lon: 77.2090, country: 'IN - Delhi Office' },
  '192.168.1.103': { lat: 28.6139, lon: 77.2090, country: 'IN - Delhi Office' },
  '10.0.0.54': { lat: -22.9068, lon: -43.1729, country: 'BR - Rio Office' },
  '192.168.1.104': { lat: -22.9068, lon: -43.1729, country: 'BR - Rio Office' },
};

interface ThreatMarker {
  id: string;
  coordinates: [number, number]; // [lon, lat]
  ip: string;
  country: string;
  severity: string;
  type: string;
  timestamp: number;
}

const WorldMap: React.FC = () => {
  const [markers, setMarkers] = useState<ThreatMarker[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<ThreatMarker | null>(null);
  const { onLog, onAlert } = useSocket();

  const resolveCoords = (ip?: string, geo?: any): { coords: [number, number]; country: string } | null => {
    if (geo && typeof geo.lon === 'number' && typeof geo.lat === 'number') {
      return { coords: [geo.lon, geo.lat], country: geo.country || 'Unknown' };
    }
    if (ip && KNOWN_GEO_COORDINATES[ip]) {
      const entry = KNOWN_GEO_COORDINATES[ip];
      return { coords: [entry.lon, entry.lat], country: entry.country };
    }
    return null;
  };

  // 1. Initial fetch of active alerts & logs on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [alertsRes, logsRes] = await Promise.all([
          api.get('/alerts?limit=30'),
          api.get('/logs?limit=30')
        ]);

        const initialMarkers: ThreatMarker[] = [];
        const seenIps = new Set<string>();

        // Add alerts first (higher priority / severity)
        for (const alert of (alertsRes.data.alerts || [])) {
          const ip = alert.sourceIP || alert.sourceIp;
          const resolved = resolveCoords(ip, alert.geoLocation);
          if (resolved && !seenIps.has(ip)) {
            seenIps.add(ip);
            initialMarkers.push({
              id: alert._id || alert.id || String(Math.random()),
              coordinates: resolved.coords,
              ip: ip || 'Unknown IP',
              country: resolved.country,
              severity: alert.severity || 'CRITICAL',
              type: alert.type || 'Alert Activity',
              timestamp: new Date(alert.createdAt || alert.timestamp || Date.now()).getTime()
            });
          }
        }

        // Add regular telemetry logs
        for (const log of (logsRes.data.logs || [])) {
          const ip = log.sourceIP || log.sourceIp;
          const resolved = resolveCoords(ip, log.geoLocation);
          if (resolved && !seenIps.has(ip)) {
            seenIps.add(ip);
            initialMarkers.push({
              id: log._id || log.id || String(Math.random()),
              coordinates: resolved.coords,
              ip: ip || 'Local Subnet',
              country: resolved.country,
              severity: 'LOW',
              type: log.action || 'Telemetry',
              timestamp: new Date(log.timestamp || Date.now()).getTime()
            });
          }
        }

        if (initialMarkers.length > 0) {
          setMarkers(initialMarkers);
        }
      } catch (err) {
        console.error('Error fetching initial map markers:', err);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Real-time updates via Socket
  useEffect(() => {
    const handleIncoming = (data: any, isAlert: boolean) => {
      const ip = data.sourceIP || data.sourceIp;
      const resolved = resolveCoords(ip, data.geoLocation);
      if (!resolved) return;

      const newMarker: ThreatMarker = {
        id: data._id || data.id || Date.now().toString(),
        coordinates: resolved.coords,
        ip: ip || 'Unknown',
        country: resolved.country,
        severity: isAlert ? (data.severity || 'CRITICAL') : 'LOW',
        type: isAlert ? (data.type || 'Threat Detected') : (data.action || 'Telemetry Log'),
        timestamp: Date.now()
      };

      setMarkers(prev => {
        const withoutOld = prev.filter(m => m.ip !== ip);
        return [newMarker, ...withoutOld].slice(0, 40);
      });
    };

    onLog((log) => handleIncoming(log, false));
    onAlert((alert) => handleIncoming(alert, true));
  }, [onLog, onAlert]);

  const getColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      default: return '#22c55e';
    }
  };

  return (
    <div className="w-full h-full bg-gray-950/50 relative overflow-hidden">
      <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 190 }} className="w-full h-full">
        <Graticule stroke="#1e293b" strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#334155"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1e293b", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            coordinates={marker.coordinates}
            onMouseEnter={() => setHoveredMarker(marker)}
            onMouseLeave={() => setHoveredMarker(null)}
            className="cursor-pointer"
          >
            <circle
              r={marker.severity === 'CRITICAL' ? 8 : marker.severity === 'HIGH' ? 6 : 4}
              fill={getColor(marker.severity)}
              className="animate-ping opacity-75"
            />
            <circle
              r={marker.severity === 'CRITICAL' ? 5 : marker.severity === 'HIGH' ? 4 : 2.5}
              fill={getColor(marker.severity)}
              stroke="#ffffff"
              strokeWidth={1}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* Hover Tooltip */}
      {hoveredMarker && (
        <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl pointer-events-none text-xs font-mono z-20">
          <div className="flex items-center space-x-2 mb-1">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block" 
              style={{ backgroundColor: getColor(hoveredMarker.severity) }} 
            />
            <span className="font-bold text-white uppercase">{hoveredMarker.severity}</span>
            <span className="text-gray-400">| {hoveredMarker.type}</span>
          </div>
          <p className="text-cyan-400 font-semibold">{hoveredMarker.ip}</p>
          <p className="text-gray-400">{hoveredMarker.country}</p>
        </div>
      )}

      {/* Legend & Active Nodes Counter */}
      <div className="absolute bottom-2 right-4 flex items-center space-x-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-gray-400 z-10">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
          <span>Crit</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
          <span>Med</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          <span>Safe</span>
        </div>
        <div className="border-l border-slate-800 pl-3 text-cyan-400 font-bold">
          {markers.length} Origin Nodes
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
