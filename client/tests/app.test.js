/**
 * @jest-environment jsdom
 */

const { EventsApp, healthCheck } = require('../app');

// Mock fetch for testing
global.fetch = jest.fn();

describe('USIU Events Frontend', () => {
  let app;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="events-loading"></div>
      <div id="events-container"></div>
      <div id="events-error" class="hidden"></div>
      <div id="clubs-loading"></div>
      <div id="clubs-container"></div>
      <div id="clubs-error" class="hidden"></div>
      <form id="event-form">
        <input type="text" id="event-title">
        <textarea id="event-description"></textarea>
        <input type="date" id="event-date">
        <input type="text" id="event-location">
        <input type="number" id="event-capacity">
        <button type="submit">Create Event</button>
      </form>
      <div id="form-message" class="hidden"></div>
    `;

    // Clear fetch mock
    fetch.mockClear();
    
    // Create new app instance
    app = new EventsApp();
  });

  describe('Events Loading', () => {
    test('should load and render events successfully', async () => {
      const mockEventsResponse = {
        success: true,
        data: [
          {
            id: 1,
            title: 'Test Event',
            description: 'Test Description',
            date: '2024-09-15',
            location: 'Test Location',
            capacity: 100,
            registered: 50
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventsResponse
      });

      await app.loadEvents();

      const container = document.getElementById('events-container');
      expect(container.innerHTML).toContain('Test Event');
      expect(container.innerHTML).toContain('Test Description');
      expect(container.innerHTML).toContain('Test Location');
    });

    test('should handle events loading error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await app.loadEvents();

      const errorEl = document.getElementById('events-error');
      expect(errorEl.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Clubs Loading', () => {
    test('should load and render clubs successfully', async () => {
      const mockClubsResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Test Club',
            description: 'Test Club Description',
            members: 50,
            president: 'John Doe'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClubsResponse
      });

      await app.loadClubs();

      const container = document.getElementById('clubs-container');
      expect(container.innerHTML).toContain('Test Club');
      expect(container.innerHTML).toContain('Test Club Description');
      expect(container.innerHTML).toContain('John Doe');
    });
  });

  describe('Event Form Validation', () => {
    test('should validate complete event form data', () => {
      const validData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-09-15',
        location: 'Test Location',
        capacity: 100
      };

      expect(app.validateEventForm(validData)).toBe(true);
    });

    test('should reject incomplete event form data', () => {
      const incompleteData = {
        title: 'Test Event',
        description: '',
        date: '2024-09-15',
        location: 'Test Location',
        capacity: 100
      };

      expect(app.validateEventForm(incompleteData)).toBe(false);
    });

    test('should reject invalid capacity', () => {
      const invalidData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-09-15',
        location: 'Test Location',
        capacity: 0
      };

      expect(app.validateEventForm(invalidData)).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('should format dates correctly', () => {
      const formattedDate = app.formatDate('2024-09-15');
      expect(formattedDate).toMatch(/September 15, 2024/);
    });

    test('should escape HTML correctly', () => {
      const escaped = app.escapeHtml('<script>alert("xss")</script>');
      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });
  });

  describe('Messages', () => {
    test('should show and hide messages', () => {
      app.showMessage('Test message', 'success');
      
      const messageEl = document.getElementById('form-message');
      expect(messageEl.textContent).toBe('Test message');
      expect(messageEl.classList.contains('success')).toBe(true);
      expect(messageEl.classList.contains('hidden')).toBe(false);
    });
  });
});

describe('Health Check', () => {
  test('should return true for healthy API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy' })
    });

    const result = await healthCheck();
    expect(result).toBe(true);
  });

  test('should return false for unhealthy API', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await healthCheck();
    expect(result).toBe(false);
  });
});