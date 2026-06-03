import { motion } from 'framer-motion';
import { Camera, Bot, Clock, HardHat, CheckCircle, AlertTriangle, ArrowUpCircle } from 'lucide-react';

export default function Tracker({ issue }) {
  const steps = [
    { id: 1, title: 'Snap & Submit', desc: 'Auto-captured GPS & Category', icon: Camera, status: 'done', time: '10:00 AM, Oct 24' },
    { id: 2, title: 'AI Verification', desc: 'Routed to PMC Road Dept.', icon: Bot, status: 'done', time: '10:02 AM, Oct 24' },
    { id: 3, title: 'Public Deadline', desc: 'SLA: Tier 3 (7 Days)', icon: Clock, status: 'done', time: '10:05 AM, Oct 24' },
    { id: 4, title: 'Proof of Work', desc: 'Waiting for daily photos...', icon: HardHat, status: 'active', time: 'Pending' },
    { id: 5, title: 'Resolution', desc: 'Final sign-off', icon: CheckCircle, status: 'waiting', time: '-' },
  ];

  return (
    <div style={{ padding: '20px', paddingBottom: '90px', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="heading-md" style={{ marginBottom: '4px' }}>Issue #PUN-8492</h2>
          <span className="badge badge-standard">Deep Pothole</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          style={{ 
            background: 'rgba(0, 240, 255, 0.1)', 
            border: '1px solid var(--accent-neon-blue)',
            color: 'var(--accent-neon-blue)',
            borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowUpCircle size={24} />
        </motion.button>
      </div>

      {/* Image Preview */}
      <div style={{ 
        width: '100%', height: '200px', 
        borderRadius: '16px', 
        background: 'url(https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80) center/cover',
        marginBottom: '24px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px',
          backdropFilter: 'blur(10px)', fontSize: '0.8rem', fontWeight: 600
        }}>📍 Narhe, Pune</div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 className="heading-md" style={{ marginBottom: '20px' }}>Accountability Engine</h3>
        
        <div style={{ position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{ 
            position: 'absolute', left: '15px', top: '20px', bottom: '20px', 
            width: '2px', background: 'var(--border-light)', zIndex: 1
          }} />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={step.id} 
                style={{ 
                  display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 2 
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isDone ? 'var(--accent-neon-green)' : isActive ? 'var(--bg-card)' : 'var(--bg-dark)',
                  border: `2px solid ${isDone ? 'var(--accent-neon-green)' : isActive ? 'var(--accent-neon-blue)' : 'var(--border-light)'}`,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  color: isDone ? '#000' : isActive ? 'var(--accent-neon-blue)' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                }}>
                  <Icon size={16} />
                </div>
                
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ 
                      fontSize: '1rem', margin: 0, 
                      color: isDone || isActive ? '#fff' : 'var(--text-secondary)' 
                    }}>{step.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{step.time}</span>
                  </div>
                  <p className="text-muted" style={{ marginTop: '4px' }}>{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
