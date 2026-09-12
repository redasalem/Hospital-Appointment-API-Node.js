const mongoose = require('mongoose');
const Doctor = require('../models/doctor.model');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Escapes special regex characters in a string to prevent ReDoS attacks
 * @param {string} str - Raw user input
 * @returns {string} Escaped string safe for use in RegExp
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Service handling Doctor business logic and database interactions
 */
class DoctorService {
  /**
   * Create and persist a new doctor profile
   * @param {Object} doctorData
   * @returns {Promise<Doctor>}
   */
  async createDoctor(doctorData) {
    const { email, password, ...profileData } = doctorData;
    const user = await User.create({
      name: profileData.name,
      email,
      password,
      role: 'doctor',
    });

    try {
      return await Doctor.create({ ...profileData, user: user._id });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  }

  /**
   * Retrieve a paginated list of doctors with filtering and search
   * @param {Object} queryOptions
   * @returns {Promise<{ doctors: Doctor[], pagination: Object }>}
   */
  async getAllDoctors(queryOptions = {}) {
    const {
      specialization,
      search,
      page = 1,
      limit = 10,
    } = queryOptions;

    const query = {};

    // Filter by specialization if provided
    if (specialization) {
      query.specialization = { $regex: `^${escapeRegex(specialization)}$`, $options: 'i' };
    }

    // Keyword search on name if provided (escaped to prevent ReDoS)
    if (search) {
      query.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Doctor.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      doctors,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };
  }

  /**
   * Fetch a single doctor by their MongoDB ID
   * @param {string} doctorId
   * @returns {Promise<Doctor>}
   */
  async getDoctorById(doctorId) {
    const doctor = await Doctor.findById(doctorId).lean();

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    return doctor;
  }

  /**
   * Update an existing doctor profile
   * @param {string} doctorId
   * @param {Object} updateData
   * @returns {Promise<Doctor>}
   */
  async updateDoctor(doctorId, updateData) {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updatedDoctor) {
      throw new ApiError('Doctor not found', 404);
    }

    return updatedDoctor;
  }

  /**
   * Delete a doctor profile while validating business integrity constraints
   * (Enforces rule: cannot delete a doctor with active/upcoming appointments)
   * @param {string} doctorId
   * @returns {Promise<Doctor>}
   */
  async deleteDoctor(doctorId) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    // Business Rule Check: Verify if doctor has active/upcoming appointments
    // Dynamically checks if the Appointment model or collection has active bookings
    const AppointmentModel = mongoose.models.Appointment;
    if (AppointmentModel) {
      const activeAppointment = await AppointmentModel.findOne({
        doctor: doctorId,
        status: { $in: ['Pending', 'Confirmed', 'pending', 'confirmed'] },
      });

      if (activeAppointment) {
        throw new ApiError(
          'Cannot delete doctor who has upcoming or active appointments',
          400
        );
      }
    } else {
      // Direct collection check as a fallback if the model isn't instantiated yet
      const db = mongoose.connection.db;
      if (db) {
        const appointmentCount = await db
          .collection('appointments')
          .countDocuments({
            doctor: new mongoose.Types.ObjectId(doctorId),
            status: { $in: ['Pending', 'Confirmed', 'pending', 'confirmed'] },
          });

        if (appointmentCount > 0) {
          throw new ApiError(
            'Cannot delete doctor who has upcoming or active appointments',
            400
          );
        }
      }
    }

    await Doctor.findByIdAndDelete(doctorId);
    return doctor;
  }
}

module.exports = new DoctorService();
