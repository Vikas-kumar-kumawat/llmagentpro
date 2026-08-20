export function formatPhoneNumber(val) {
  if (!val) return '';
  const raw = val.trim();
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return raw;
  if (cleaned.startsWith('+')) return cleaned;
  const noZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${noZero}`;
}

export const DEFAULT_FEEDBACKS = [
  { id: 'd1', customer_name: 'Aarav Patel', phone: '+919876543210', feedback_text: 'Internet is too slow during evenings.', sentiment: 'negative', rating: 2, category: 'speed', created_at: '2 hours ago' },
  { id: 'd2', customer_name: 'Priya Sharma', phone: '+919876543211', feedback_text: 'Great service, very happy.', sentiment: 'positive', rating: 5, category: 'general', created_at: '4 hours ago' },
  { id: 'd3', customer_name: 'Rahul Verma', phone: '+919876543212', feedback_text: 'Frequent disconnections.', sentiment: 'negative', rating: 1, category: 'stability', created_at: '5 hours ago' },
  { id: 'd4', customer_name: 'Sneha Gupta', phone: '+919876543213', feedback_text: 'Installation was smooth and quick.', sentiment: 'positive', rating: 4, category: 'installation', created_at: '6 hours ago' },
  { id: 'd5', customer_name: 'Vikram Singh', phone: '+919876543214', feedback_text: 'Billing is a bit confusing.', sentiment: 'neutral', rating: 3, category: 'billing', created_at: '1 day ago' },
  { id: 'd6', customer_name: 'Ananya Desai', phone: '+919876543215', feedback_text: 'Customer support was very helpful.', sentiment: 'positive', rating: 5, category: 'support', created_at: '1 day ago' },
  { id: 'd7', customer_name: 'Rohan Kapoor', phone: '+919876543216', feedback_text: 'Router range is very poor.', sentiment: 'negative', rating: 2, category: 'hardware', created_at: '2 days ago' },
  { id: 'd8', customer_name: 'Neha Reddy', phone: '+919876543217', feedback_text: 'Consistent speeds, no issues.', sentiment: 'positive', rating: 4, category: 'speed', created_at: '2 days ago' },
  { id: 'd9', customer_name: 'Karan Malhotra', phone: '+919876543218', feedback_text: 'Plan upgrades are too expensive.', sentiment: 'neutral', rating: 3, category: 'billing', created_at: '3 days ago' },
  { id: 'd10', customer_name: 'Pooja Joshi', phone: '+919876543219', feedback_text: 'Best ISP I have ever used.', sentiment: 'positive', rating: 5, category: 'general', created_at: '3 days ago' }
];
