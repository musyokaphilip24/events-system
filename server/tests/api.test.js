const request = require('supertest');
const { app, server } = require('../index');

describe('USIU Events API', () => {
  
  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('Events API', () => {
    test('GET /api/events should return all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('date');
    });

    test('GET /api/events/:id should return specific event', async () => {
      const response = await request(app)
        .get('/api/events/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.title).toBe('USIU Tech Conference 2024');
    });

    test('GET /api/events/:id should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });

    test('POST /api/events should create new event', async () => {
      const newEvent = {
        title: 'Test Event',
        description: 'Test event description',
        date: '2024-12-01',
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newEvent.title);
      expect(response.body.data.capacity).toBe(newEvent.capacity);
      expect(response.body.data.registered).toBe(0);
      expect(response.body.message).toBe('Event created successfully');
    });

    test('POST /api/events should return 400 for missing fields', async () => {
      const incompleteEvent = {
        title: 'Test Event'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/events')
        .send(incompleteEvent)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('Clubs API', () => {
    test('GET /api/clubs should return all clubs', async () => {
      const response = await request(app)
        .get('/api/clubs')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('members');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });
});