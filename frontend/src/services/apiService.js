const API_BASE_URL = 'http://localhost:8000';

export async function getServiceStatus() {
  const res = await fetch(`${API_BASE_URL}/`);
  return await res.json();
}

export async function getContactsAndLogs() {
  const res = await fetch(`${API_BASE_URL}/api/v1/contacts`);
  return await res.json();
}

export async function makeOutboundCall(name, phone, message) {
  const res = await fetch(`${API_BASE_URL}/api/v1/make-call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, message: message || undefined })
  });
  return await res.json();
}

export async function executeFeedbackAgent(customer_name, phone, rating, feedback_text) {
  const res = await fetch(`${API_BASE_URL}/api/v1/agents/feedback/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name, phone, rating, feedback_text })
  });
  return await res.json();
}

export async function getFeedbackAndTickets() {
  const res = await fetch(`${API_BASE_URL}/api/v1/agents/feedback`);
  return await res.json();
}

export async function executeRechargeReminderAgent(customer_name, phone, plan_name, expiry_date, amount) {
  const res = await fetch(`${API_BASE_URL}/api/v1/agents/recharge/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name, phone, plan_name, expiry_date, amount })
  });
  return await res.json();
}

export async function executeNewOffersAgent(customer_name, phone, offer_title, discount_percent, special_price) {
  const res = await fetch(`${API_BASE_URL}/api/v1/agents/offers/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name, phone, offer_title, discount_percent, special_price })
  });
  return await res.json();
}

export async function getVoiceCatalog() {
  const res = await fetch(`${API_BASE_URL}/api/v1/voices`);
  return await res.json();
}

export async function updateActiveVoice(voice_id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/voices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_id })
  });
  return await res.json();
}

export async function getCustomersList() {
  const res = await fetch(`${API_BASE_URL}/api/v1/customers`);
  return await res.json();
}

export async function createCustomerRecord(name, phone) {
  const res = await fetch(`${API_BASE_URL}/api/v1/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone })
  });
  return await res.json();
}

export async function updateCustomerRecord(customer_id, data) {
  const res = await fetch(`${API_BASE_URL}/api/v1/customers/${customer_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function deleteCustomerRecord(customer_id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/customers/${customer_id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function cancelActiveCall(call_sid) {
  const res = await fetch(`${API_BASE_URL}/api/v1/cancel-call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call_sid })
  });
  return await res.json();
}
