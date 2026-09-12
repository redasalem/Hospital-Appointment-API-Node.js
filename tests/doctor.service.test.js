const mongoose = require('mongoose');
const doctorService = require('../src/services/doctor.service');
const Doctor = require('../src/models/doctor.model');
const { connectDB, closeDB, clearDB } = require('./testDb');

// Increase timeout for test database operations
jest.setTimeout(30000);

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

// ── Tests ──────────────────────────────────────────────────────────
describe('DoctorService', () => {
  // ── createDoctor ───────────────────────────────────────────────
  describe('createDoctor', () => {
    it('should create a new doctor successfully', async () => {
      const doctor = await doctorService.createDoctor(sampleDoctor);

      expect(doctor).toBeDefined();
      expect(doctor.name).toBe(sampleDoctor.name);
      expect(doctor.specialization).toBe(sampleDoctor.specialization);
      expect(doctor.phone).toBe(sampleDoctor.phone);
      expect(doctor.workingHours).toHaveLength(2);
      expect(doctor.isActive).toBe(true);
    });

    it('should throw validation error when required fields are missing', async () => {
      await expect(doctorService.createDoctor({})).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      const doctor = await doctorService.createDoctor({
        name: 'Dr. Test',
        specialization: 'General',
        phone: '01099999999',
      });

      expect(doctor.isActive).toBe(true);
      expect(doctor.description).toBe('');
      expect(doctor.workingHours).toHaveLength(0);
    });
  });

  // ── getAllDoctors ──────────────────────────────────────────────
  describe('getAllDoctors', () => {
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

    it('should return all doctors with pagination', async () => {
      const result = await doctorService.getAllDoctors();

      expect(result.doctors).toHaveLength(3);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should paginate results correctly', async () => {
      const result = await doctorService.getAllDoctors({ page: 1, limit: 2 });

      expect(result.doctors).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });

    it('should filter by specialization (case-insensitive)', async () => {
      const result = await doctorService.getAllDoctors({
        specialization: 'cardiology',
      });

      expect(result.doctors).toHaveLength(2);
      result.doctors.forEach((doc) => {
        expect(doc.specialization).toBe('Cardiology');
      });
    });

    it('should search by name', async () => {
      const result = await doctorService.getAllDoctors({ search: 'Sara' });

      expect(result.doctors).toHaveLength(1);
      expect(result.doctors[0].name).toBe('Dr. Sara Ali');
    });

    it('should return empty array when no matches found', async () => {
      const result = await doctorService.getAllDoctors({
        specialization: 'Neurology',
      });

      expect(result.doctors).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  // ── getDoctorById ─────────────────────────────────────────────
  describe('getDoctorById', () => {
    it('should return a doctor by ID', async () => {
      const created = await Doctor.create(sampleDoctor);
      const doctor = await doctorService.getDoctorById(created._id.toString());

      expect(doctor).toBeDefined();
      expect(doctor.name).toBe(sampleDoctor.name);
    });

    it('should throw 404 error when doctor not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(doctorService.getDoctorById(fakeId)).rejects.toThrow(
        'Doctor not found'
      );
    });
  });

  // ── updateDoctor ──────────────────────────────────────────────
  describe('updateDoctor', () => {
    it('should update doctor data successfully', async () => {
      const created = await Doctor.create(sampleDoctor);
      const updated = await doctorService.updateDoctor(
        created._id.toString(),
        { name: 'Dr. Ahmed Salem', phone: '01011111111' }
      );

      expect(updated.name).toBe('Dr. Ahmed Salem');
      expect(updated.phone).toBe('01011111111');
      expect(updated.specialization).toBe(sampleDoctor.specialization);
    });

    it('should throw 404 error when updating non-existent doctor', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        doctorService.updateDoctor(fakeId, { name: 'New Name' })
      ).rejects.toThrow('Doctor not found');
    });
  });

  // ── deleteDoctor ──────────────────────────────────────────────
  describe('deleteDoctor', () => {
    it('should delete a doctor successfully', async () => {
      const created = await Doctor.create(sampleDoctor);
      const deleted = await doctorService.deleteDoctor(created._id.toString());

      expect(deleted.name).toBe(sampleDoctor.name);

      const found = await Doctor.findById(created._id);
      expect(found).toBeNull();
    });

    it('should throw 404 error when deleting non-existent doctor', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(doctorService.deleteDoctor(fakeId)).rejects.toThrow(
        'Doctor not found'
      );
    });
  });
});
