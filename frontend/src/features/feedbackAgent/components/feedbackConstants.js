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
  {
    id: 101,
    customer_name: 'Vikas Kumar',
    phone: '+919057262630',
    avatar: 'VK',
    avatarBg: 'bg-gradient-to-tr from-cyan-600 to-blue-600',
    feedback_text: 'The service was wonderful! Quick delivery and friendly staff.',
    sentiment: 'positive',
    rating: 5,
    category: 'service_quality',
    created_at: 'Aug 17, 2025 10:24 AM'
  },
  {
    id: 102,
    customer_name: 'Priya Mehta',
    phone: '+918765432109',
    avatar: 'PM',
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-pink-600',
    feedback_text: 'Delivery was on time but packaging could be better.',
    sentiment: 'neutral',
    rating: 3,
    category: 'delivery_packaging',
    created_at: 'Aug 17, 2025 09:58 AM'
  },
  {
    id: 103,
    customer_name: 'Arjun Verma',
    phone: '+917654321098',
    avatar: 'AV',
    avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-600',
    feedback_text: 'The product stopped working after a few days. Need help.',
    sentiment: 'negative',
    rating: 1,
    category: 'product_defect',
    created_at: 'Aug 17, 2025 09:41 AM'
  },
  {
    id: 104,
    customer_name: 'Neha Kapoor',
    phone: '+916543210987',
    avatar: 'NK',
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    feedback_text: 'Great experience overall. Will recommend to others!',
    sentiment: 'positive',
    rating: 5,
    category: 'general_praise',
    created_at: 'Aug 17, 2025 09:20 AM'
  },
  {
    id: 105,
    customer_name: 'Manish Yadav',
    phone: '+915432109876',
    avatar: 'MY',
    avatarBg: 'bg-gradient-to-tr from-rose-600 to-red-600',
    feedback_text: 'The app is good but it needs more payment options.',
    sentiment: 'neutral',
    rating: 3,
    category: 'feature_request',
    created_at: 'Aug 17, 2025 08:55 AM'
  }
];
