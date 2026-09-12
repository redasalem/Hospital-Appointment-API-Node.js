const crypto = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Doctor = require('../src/models/doctor.model');
const User = require('../src/models/User');
const { connectDB, closeDB, clearDB } = require('./testDb');

// Increase timeout for test database operations
jest.setTimeout(30000);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Helper to generate a valid JWT with jti
function generateTestToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// ── Test Fixtures ──────────────────────────────────────────────────
const sampleDoctor = {
  name: 'Dr. Ahmed Hassan',
  specialization: 'Cardiology',
  description: 'Experienced heart specialist',
  phone: '01012345678',
  workingHours: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', startTime: '10:00', endTime: '15:00' },
  ],
};

let adminToken;
let patientToken;
let doctorUserId;

// ── Setup & Teardown ───────────────────────────────────────────────
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

afterEach(async () => {
  await clearDB();
});

beforeEach(async () => {
  const timestamp = `${Date.now()}-${Math.random()}`;

  const adminUser = await User.create({
    name: 'Admin User',
    email: `admin-${timestamp}@example.com`,
    password: 'password123',
    role: 'admin',
  });
  adminToken = generateTestToken(adminUser);

  const patientUser = await User.create({
    name: 'Patient User',
    email: `patient-${timestamp}@example.com`,
    password: 'password123',
    role: 'patient',
  });
  patientToken = generateTestToken(patientUser);

  const doctorAccount = await User.create({
    name: 'Doctor Account',
    email: `doctor-${timestamp}@example.com`,
    password: 'password123',
    role: 'doctor',
  });
  doctorUserId = doctorAccount._id.toString();
});

// ── Tests ──────────────────────────────────────────────────────────
describe('Doctor Routes - /api/doctors', () => {
  // ── Authentication & Authorization ────────────────────────────
  describe('RBAC & Authentication', () => {
    it('should return 401 when creating doctor without token', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .send({ ...sampleDoctor, user: doctorUserId })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized|token/i);
    });

    it('should return 403 when non-Admin role tries to create doctor', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ ...sampleDoctor, user: doctorUserId })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission/i);
    });
  });

  // ── POST /api/doctors ─────────────────────────────────────────
  describe('POST /api/doctors', () => {
    it('should create a new doctor (201) when user is Admin', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...sampleDoctor, user: doctorUserId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Doctor created successfully');
      expect(res.body.data.name).toBe(sampleDoctor.name);
      expect(res.body.data.specialization).toBe(sampleDoctor.specialization);
      expect(res.body.data.phone).toBe(sampleDoctor.phone);
      expect(res.body.data.workingHours).toHaveLength(2);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'No name or specialization' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 when name is too short', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...sampleDoctor, user: doctorUserId, name: 'A' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid working hours time format', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleDoctor,
          user: doctorUserId,
          workingHours: [
            { day: 'Monday', startTime: '25:00', endTime: '17:00' },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 when endTime is before startTime', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleDoctor,
          user: doctorUserId,
          workingHours: [
            { day: 'Monday', startTime: '17:00', endTime: '09:00' },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ── GET /api/doctors ──────────────────────────────────────────
  describe('GET /api/doctors', () => {
    beforeEach(async () => {
      await Doctor.create([
        { ...sampleDoctor },
        {
          name: 'Dr. Sara Ali',
          specialization: 'Dermatology',
          phone: '01098765432',
        },
        {
          name: 'Dr. Mohamed Nabil',
          specialization: 'Cardiology',
          phone: '01055555555',
        },
      ]);
    });

    it('should return all doctors (200)', async () => {
      const res = await request(app).get('/api/doctors').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(3);
    });

    it('should filter by specialization', async () => {
      const res = await request(app)
        .get('/api/doctors?specialization=Cardiology')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
    });

    it('should search by name', async () => {
      const res = await request(app)
        .get('/api/doctors?search=Sara')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Dr. Sara Ali');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/doctors?page=1&limit=2')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });
  });

  // ── GET /api/doctors/:id ──────────────────────────────────────
  describe('GET /api/doctors/:id', () => {
    it('should return a doctor by ID (200)', async () => {
      const doctor = await Doctor.create(sampleDoctor);

      const res = await request(app)
        .get(`/api/doctors/${doctor._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sampleDoctor.name);
    });

    it('should return 404 when doctor not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/doctors/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Doctor not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/doctors/invalid-id-123')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ── PATCH /api/doctors/:id ────────────────────────────────────
  describe('PATCH /api/doctors/:id', () => {
    it('should update a doctor (200) with Admin token', async () => {
      const doctor = await Doctor.create(sampleDoctor);

      const res = await request(app)
        .patch(`/api/doctors/${doctor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dr. Ahmed Salem', phone: '01011111111' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Dr. Ahmed Salem');
      expect(res.body.data.phone).toBe('01011111111');
    });

    it('should return 404 when doctor not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/doctors/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 when body is empty', async () => {
      const doctor = await Doctor.create(sampleDoctor);

      const res = await request(app)
        .patch(`/api/doctors/${doctor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ── DELETE /api/doctors/:id ───────────────────────────────────
  describe('DELETE /api/doctors/:id', () => {
    it('should delete a doctor (200) with Admin token', async () => {
      const doctor = await Doctor.create(sampleDoctor);

      const res = await request(app)
        .delete(`/api/doctors/${doctor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Doctor deleted successfully');

      // Verify doctor is actually deleted
      const found = await Doctor.findById(doctor._id);
      expect(found).toBeNull();
    });

    it('should return 404 when doctor not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/doctors/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/doctors/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
