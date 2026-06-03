import { motion } from 'framer-motion';
import { AlertOctagon, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

export default function Leaderboard() {
  const departments = [
    { name: 'PCMC Water Works', score: 98, trend: 'up', status: 'fame' },
    { name: 'Cantonment Solid Waste', score: 85, trend: 'up', status: 'fame' },
    { name: 'PMC Road Maintenance', score: 42, trend: 'down', status: 'shame', notices: 12 },
    { name: 'PMC Drainage Dept', score: 15, trend: 'down', status: 'shame', notices: 34 },
  ];

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="heading-lg">Wall of Accountability</h1>
        <p className="text-muted">Live performance scores of civic bodies</p>
      </div>

      {/* Kill Switch Alerts */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel animate-pulse" 
        style={{ 
          padding: '16px', marginBottom: '24px', 
          border: '1px solid rgba(255, 42, 42, 0.4)',
          background: 'rgba(255, 42, 42, 0.05)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShieldAlert color="var(--accent-crimson)" size={28} />
          <div>
            <h4 style={{ color: 'var(--accent-crimson)', margin: 0, fontSize: '1rem' }}>Kill Switch Activated</h4>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
              3 Disciplinary reports sent to PMC Commissioner today.
            </p>
          </div>
        </div>
      </motion.div>

      <h3 className="heading-md" style={{ marginBottom: '16px', color: 'var(--accent-neon-green)' }}>🏆 Wall of Fame</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {departments.filter(d => d.status === 'fame').map((dept, i) => (
          <motion.div 
            key={dept.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel" 
            style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>{dept.name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={14} color="var(--accent-neon-green)" />
                <span className="text-muted">Resolving on time</span>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: 'var(--accent-neon-green)' }}>
              {dept.score}
            </div>
          </motion.div>
        ))}
      </div>

      <h3 className="heading-md" style={{ marginBottom: '16px', color: 'var(--accent-crimson)' }}>🚨 Wall of Shame</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {departments.filter(d => d.status === 'shame').map((dept, i) => (
          <motion.div 
            key={dept.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel" 
            style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>{dept.name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <AlertOctagon size={14} color="var(--accent-crimson)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-crimson)' }}>{dept.notices} Notices Issued</span>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: 'var(--accent-crimson)' }}>
              {dept.score}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
