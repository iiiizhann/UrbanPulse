const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const alertService = {
  async getRules() {
    const res = await fetch(`${BASE_URL}/alerts`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch rules');
    return json.data || [];
  },

  async createRule(payload) {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create rule');
    return json.data;
  },

  async toggleRule(id, isActive) {
    const res = await fetch(`${BASE_URL}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update rule');
    return json.data;
  },

  async deleteRule(id) {
    const res = await fetch(`${BASE_URL}/alerts/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete rule');
    return json;
  },
};