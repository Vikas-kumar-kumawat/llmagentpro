import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { SectionCard } from './components/common/SectionCard';
import { ChatbotSection } from './features/chatbot/ChatbotSection';
import { FeedbackAgentSection } from './features/feedbackAgent/FeedbackAgentSection';
import { MakeCallSection } from './features/outboundCalls/MakeCallSection';
import { RechargeReminderSection } from './features/rechargeAgent/RechargeReminderSection';
import { NewOffersSection } from './features/offersAgent/NewOffersSection';
import { CompetitorMonitoringSection } from './features/competitorAgent/CompetitorMonitoringSection';
import { HistorySection } from './features/history/HistorySection';
import { LoginPage } from './features/auth/LoginPage';
import { getServiceStatus, getContactsAndLogs, getFeedbackAndTickets } from './services/apiService';

import { Navbar } from './components/layout/Navbar';

function MainAppLayout({ onLogout }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeAgent, setActiveAgent] = useState('chatbot');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [_twilioConfigured, setTwilioConfigured] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [statusData, contactsData, feedbackData] = await Promise.all([
        getServiceStatus(),
        getContactsAndLogs(),
        getFeedbackAndTickets()
      ]);

      setTwilioConfigured(statusData.twilio_configured);
      setContacts(contactsData.contacts || []);
      setCallLogs(contactsData.call_logs || []);
      setFeedbackEntries(feedbackData.feedback_entries || []);
      setSupportTickets(feedbackData.support_tickets || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#000000] text-[#f8fafc]' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* BFibernet Sidebar */}
      <Sidebar
        activeAgent={activeAgent}
        setActiveAgent={setActiveAgent}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main BFibernet Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Navbar Header with Admin Badge */}
        <Navbar onLogout={onLogout} />

        {/* Dynamic Agent Workspace View */}
        <div className={`flex-1 w-full ${['feedback', 'recharge', 'offers', 'competitor'].includes(activeAgent) ? 'max-w-7xl mx-auto p-4 md:p-6' : 'max-w-5xl mx-auto p-4 md:p-6'}`}>
          {activeAgent === 'chatbot' && (
            <ChatbotSection onSwitchTab={(tab) => setActiveAgent(tab)} />
          )}

          {activeAgent === 'feedback' && (
            <FeedbackAgentSection
              feedbackEntries={feedbackEntries}
              isLoading={isLoading}
              onRefreshData={loadAllData}
            />
          )}

          {activeAgent === 'recharge' && (
            <RechargeReminderSection
              onRefreshData={loadAllData}
            />
          )}

          {activeAgent === 'offers' && (
            <NewOffersSection
              onRefreshData={loadAllData}
            />
          )}

          {activeAgent === 'competitor' && (
            <CompetitorMonitoringSection
              onRefreshData={loadAllData}
            />
          )}

          {(activeAgent === 'outbound' || activeAgent === 'calls') && (
            <div className="max-w-3xl mx-auto pt-4">
              <SectionCard
                icon="📞"
                title="Sales Calls Agent"
                subtitle="Trigger voice calls via Twilio Voice API (Auto +91 prefixing)"
                tag="POST /api/v1/make-call"
                isOpen={true}
                onToggle={() => { }}
              >
                <MakeCallSection onRefreshData={loadAllData} />
              </SectionCard>
            </div>
          )}

          {activeAgent === 'history' && (
            <div className="max-w-3xl mx-auto pt-4">
              <SectionCard
                icon="🎫"
                title="Customer Support Agent"
                subtitle={`${feedbackEntries.length} Feedback Entries | ${supportTickets.length} Emergency Support Tickets`}
                isOpen={true}
                onToggle={() => { }}
              >
                <HistorySection
                  feedbackEntries={feedbackEntries}
                  supportTickets={supportTickets}
                  contacts={contacts}
                  callLogs={callLogs}
                  onUseContact={() => setActiveAgent('outbound')}
                />
              </SectionCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bfibernet_auth') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('bfibernet_auth');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <MainAppLayout onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </ThemeProvider>
  );
}

export default App;
