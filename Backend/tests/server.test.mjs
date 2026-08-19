import request from 'supertest';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockSave = jest.fn();

class MockUser {
  constructor(data) {
    this._id = 'test-user-id';
    this.email = data.email;
    this.password = data.password;
    this.save = mockSave;
  }

  static findOne(...args) {
    return mockFindOne(...args);
  }

  static updateOne(...args) {
    return mockUpdateOne(...args);
  }
}

jest.unstable_mockModule('mongoose', () => ({
  default: {
    Schema: jest.fn(),
    model: jest.fn(() => MockUser),
    connection: {
      readyState: 1
    },
    connect: jest.fn()
  }
}));

const { app } = await import('../server.mjs');

describe('Auth API', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns UP when MongoDB is connected', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'UP',
      mongodb: 'connected'
    });
  });

  test('POST /register rejects an already registered email', async () => {
    mockFindOne.mockResolvedValue({
      email: 'test@example.com'
    });

    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Email already registered'
    });
  });

  test('POST /register creates a new user', async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockResolvedValue(true);

    const response = await request(app)
      .post('/register')
      .send({
        email: 'new@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      userId: 'test-user-id'
    });

    expect(mockSave).toHaveBeenCalled();
  });

  test('POST /login rejects invalid credentials', async () => {
    mockFindOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'unknown@example.com',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid credentials'
    });
  });

  test('POST /login accepts valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    mockFindOne.mockResolvedValue({
      email: 'test@example.com',
      password: passwordHash
    });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Login successful'
    });
  });

  test('POST /reset-password returns 404 for unknown email', async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 0
    });

    const response = await request(app)
      .post('/reset-password')
      .send({
        email: 'unknown@example.com',
        newPassword: 'newpassword123'
      });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: 'Email not found'
    });
  });

  test('POST /reset-password updates an existing user', async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 1
    });

    const response = await request(app)
      .post('/reset-password')
      .send({
        email: 'test@example.com',
        newPassword: 'newpassword123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Password reset successful'
    });

    expect(mockUpdateOne).toHaveBeenCalled();
  });

});
