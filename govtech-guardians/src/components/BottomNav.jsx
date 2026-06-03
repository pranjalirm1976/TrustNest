import { Map, Activity, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const navItems = [
    { id: 'home', icon: Map, label: 'Map' },
    { id: 'tracker', icon: Activity, label: 'Track' },
    { id: 'leaderboard', icon: Trophy, label: 'Rankings' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      background: 'rgba(15, 17, 21, 0.85)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--accent-neon-blue)' : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              position: 'relative',
              width: '60px'
            }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500, fontFamily: 'Outfit, sans-serif' }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: 'absolute',
                  top: '-15px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-neon-blue)',
                  boxShadow: '0 0 10px var(--accent-neon-blue)'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
