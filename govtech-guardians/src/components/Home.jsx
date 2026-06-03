import { useState } from 'react';
import { Map, AdvancedMarker, APIProvider } from '@vis.gl/react-google-maps';
import { Camera, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
  { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] }
];

const mockIssues = [
  { id: 1, lat: 18.5204, lng: 73.8567, type: 'emergency', status: 'escalated' },
  { id: 2, lat: 18.5300, lng: 73.8400, type: 'high', status: 'pending' },
  { id: 3, lat: 18.5100, lng: 73.8600, type: 'standard', status: 'resolved' },
];

export default function Home({ onTrack }) {
  const [showFAB, setShowFAB] = useState(true);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Header Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: '20px',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(15,17,21,0.9), transparent)',
        pointerEvents: 'none'
      }}>
        <h1 className="heading-lg" style={{ margin: 0 }}>Pune City</h1>
        <p className="text-muted">GovTech Guardians Active Grid</p>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', pointerEvents: 'auto' }}>
          <span className="badge badge-emergency">2 Critical</span>
          <span className="badge badge-success">45 Resolved Today</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
        <APIProvider apiKey={"dummy_key_for_testing"}>
          <Map
            defaultCenter={{ lat: 18.5204, lng: 73.8567 }} // Pune coordinates
            defaultZoom={13}
            styles={darkMapStyle}
            disableDefaultUI={true}
            mapId="DEMO_MAP_ID"
          >
            {mockIssues.map(issue => (
              <AdvancedMarker 
                key={issue.id} 
                position={{ lat: issue.lat, lng: issue.lng }}
                onClick={() => onTrack(issue)}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  className={issue.type === 'emergency' ? 'animate-pulse' : ''}
                  style={{
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: issue.status === 'resolved' ? 'var(--accent-neon-green)' : 
                                issue.type === 'emergency' ? 'var(--accent-crimson)' : 'var(--accent-orange)',
                    border: '3px solid #1a1d24',
                    boxShadow: `0 0 15px ${issue.status === 'resolved' ? 'var(--accent-neon-green)' : 
                                        issue.type === 'emergency' ? 'var(--accent-crimson)' : 'var(--accent-orange)'}`,
                    cursor: 'pointer'
                  }}
                />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* Floating Action Button (Snap & Submit) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          bottom: '20px', // Right above the bottom nav
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'linear-gradient(135deg, var(--accent-neon-blue), #0066ff)',
          color: '#fff',
          border: 'none',
          borderRadius: '30px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: '700',
          fontSize: '1rem',
          boxShadow: '0 10px 25px rgba(0, 240, 255, 0.4)',
          cursor: 'pointer'
        }}
      >
        <Camera size={24} />
        Report Issue
      </motion.button>
    </div>
  );
}
