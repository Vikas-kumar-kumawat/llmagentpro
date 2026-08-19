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
import { SalesAgentSection } from './features/salesAgent/SalesAgentSection';
import { HistorySection } from './features/history/HistorySection';
import { LoginPage } from './features/auth/LoginPage';
import { getServiceStatus, getContactsAndLogs, getFeedbackAndTickets } from './services/apiService';

import { Navbar } from './components/layout/Navbar';

function MainAppLayout({ onLogout }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeAgent, setActiveAgent] = useState('chatbot');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [_twilioConfigured, setTwilioConfigured] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [statusData, contactsData, feedbackData] = await Promise.all([
        getServiceStatus().catch(() => ({ twilio_configured: false })),
        getContactsAndLogs().catch(() => ({ contacts: [], call_logs: [] })),
        getFeedbackAndTickets().catch(() => ({ feedback_entries: [], support_tickets: [] }))
      ]);

      setTwilioConfigured(statusData?.twilio_configured || false);
      setContacts(contactsData?.contacts || []);
      setCallLogs(contactsData?.call_logs || []);
      setFeedbackEntries(feedbackData?.feedback_entries || []);
      setSupportTickets(feedbackData?.support_tickets || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const [activeCallItem, setActiveCallItem] = useState(null);

  const handleGlobalTriggerCall = (name, phone) => {
    const item = {
      id: `c_${Date.now()}`,
      customer_name: name,
      phone: phone,
      sentiment: 'neutral',
      rating: 5,
      created_at: 'Just now'
    };
    setActiveCallItem(item);
    setActiveAgent('feedback');
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* BFibernet Sidebar */}
      <Sidebar
        activeAgent={activeAgent}
        setActiveAgent={setActiveAgent}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={onLogout}
      />


      {/* Main BFibernet Workspace */}
      <main className={`flex-1 flex flex-col h-screen overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc]'}`}>
        {/* Top Navbar Header with Admin Badge */}
        <Navbar 
          onLogout={onLogout} 
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Dynamic Agent Workspace View — Notion Document Centered Layout */}
        <div className={`flex-1 w-full ${
          activeAgent === 'chatbot' 
            ? 'w-full h-full p-0 flex flex-col overflow-hidden' 
            : ['feedback', 'recharge', 'offers', 'competitor', 'sales'].includes(activeAgent) 
              ? 'max-w-6xl mx-auto p-2 sm:p-4 md:p-8' 
              : 'max-w-4xl mx-auto p-2 sm:p-4 md:p-8'
        }`}>
          {activeAgent === 'chatbot' && (
            <ChatbotSection onSwitchTab={(tab) => setActiveAgent(tab)} />
          )}


          {activeAgent === 'sales' && (
            <SalesAgentSection />
          )}

          {activeAgent === 'feedback' && (
            <FeedbackAgentSection
              feedbackEntries={feedbackEntries}
              isLoading={isLoading}
              onRefreshData={loadAllData}
              initialSelectedFeedback={activeCallItem}
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
                icon="🎧"
                title="Customer Support Agent"
                subtitle="Trigger voice calls & AI support operations via Twilio Voice API"
                tag="POST /api/v1/make-call"
                isOpen={true}
                onToggle={() => { }}
              >
                <MakeCallSection onRefreshData={loadAllData} onTriggerCall={handleGlobalTriggerCall} />
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
