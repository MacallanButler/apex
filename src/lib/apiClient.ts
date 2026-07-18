const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api/v1`;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('apex_jwt') : null;
  if (token) {
    headers['Authorization'] = token;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const authHeader = res.headers.get('Authorization');
  if (authHeader && typeof window !== 'undefined') {
    localStorage.setItem('apex_jwt', authHeader);
  }

  if (!res.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await res.json();
      errorMessage = errData.error || errData.errors?.join(', ') || errData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
};

export const apiClient = {
  async login(email: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email, password: 'password' } }),
    });
    const data = await handleResponse(res);
    return data.user;
  },

  async register(email: string, name: string, phone?: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email, name, phone, password: 'password', password_confirmation: 'password' } }),
    });
    const data = await handleResponse(res);
    return data.user;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (_) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apex_jwt');
    }
  },

  async me() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('apex_jwt') : null;
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await handleResponse(res);
      return data.user;
    } catch (e) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apex_jwt');
      }
      return null;
    }
  },

  async guestUpgrade(email: string, password: string, name: string, phone?: string) {
    const res = await fetch(`${API_URL}/auth/guest_upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone }),
    });
    const data = await handleResponse(res);
    return data.user;
  },

  async getSlots(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const res = await fetch(`${API_URL}/time_slots?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSlot(slot: { date: string; time: string; capacity: number; location?: string }) {
    const res = await fetch(`${API_URL}/time_slots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ time_slot: slot }),
    });
    return handleResponse(res);
  },

  async updateSlot(id: string, slot: Partial<{ date: string; time: string; capacity: number; location: string }>) {
    const res = await fetch(`${API_URL}/time_slots/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ time_slot: slot }),
    });
    return handleResponse(res);
  },

  async deleteSlot(id: string) {
    const res = await fetch(`${API_URL}/time_slots/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBookings(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const res = await fetch(`${API_URL}/bookings?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getMyBookings() {
    const res = await fetch(`${API_URL}/bookings/mine`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBooking(id: string) {
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createBooking(booking: {
    time_slot_id: string;
    package: string;
    instructor_id?: string;
    total_cents: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    extras: string[];
    waiver_acknowledgment_attributes?: {
      age_confirmed: boolean;
      weight_confirmed: boolean;
      health_confirmed: boolean;
      alcohol_confirmed: boolean;
      risk_acknowledged: boolean;
      ip_address?: string;
    };
  }) {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ booking }),
    });
    return handleResponse(res);
  },

  async getPaymentIntent(bookingId: string) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/payment_intent`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id: string, status: string, instructorId?: string) {
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ booking: { status, instructor_id: instructorId } }),
    });
    return handleResponse(res);
  },

  async getCurrentWeather() {
    const res = await fetch(`${API_URL}/weather/current`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateUserRole(userId: string, role: string) {
    const res = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },
};
