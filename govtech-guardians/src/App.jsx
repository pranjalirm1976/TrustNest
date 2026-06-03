import { useState } from 'react';
import Home from './components/Home';
import Tracker from './components/Tracker';
import Leaderboard from './components/Leaderboard';
import BottomNav from './components/BottomNav';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const navigateToTracker = (issue) => {
    setSelectedIssue(issue);
    setCurrentTab('tracker');
  };

  return (
    <div id="app-container">
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '70px' }}>
        {currentTab === 'home' && <Home onTrack={navigateToTracker} />}
        {currentTab === 'tracker' && <Tracker issue={selectedIssue} />}
        {currentTab === 'leaderboard' && <Leaderboard />}
      </div>
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
