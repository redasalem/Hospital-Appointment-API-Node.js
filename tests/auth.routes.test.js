const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectDB, closeDB, clearDB } = require('./testDb');

jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

afterEach(async () => {
  await clearDB();
});

describe('Authentication routes', () => {
  it('registers a patient account', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Patient',
        email: 'jane.patient@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(response.body.data.role).toBe('patient');
    const user = await User.findOne({ email: 'jane.patient@example.com' });
    expect(user.role).toBe('patient');
  });

  it('rejects a doctor role supplied to public registration', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Public',
        email: 'dr.public@example.com',
        password: 'SecurePass123!',
        role: 'doctor',
      })
      .expect(400);

    expect(await User.exists({ email: 'dr.public@example.com' })).toBeNull();
  });
});
