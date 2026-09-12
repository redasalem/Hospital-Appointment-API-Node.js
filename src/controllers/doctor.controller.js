const doctorService = require('../services/doctor.service');


class DoctorController {

  async createDoctor(req, res, next) {
    try {
      const doctor = await doctorService.createDoctor(req.body);

      return res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of doctors with filtering and pagination
   * @route GET /api/doctors
   */
  async getAllDoctors(req, res, next) {
    try {
      const result = await doctorService.getAllDoctors(req.query);

      return res.status(200).json({
        success: true,
        message: 'Doctors retrieved successfully',
        data: result.doctors,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get details of a specific doctor by ID
   * @route GET /api/doctors/:id
   */
  async getDoctorById(req, res, next) {
    try {
      const doctor = await doctorService.getDoctorById(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Doctor retrieved successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing doctor profile
   * @route PATCH /api/doctors/:id
   */
  async updateDoctor(req, res, next) {
    try {
      const doctor = await doctorService.updateDoctor(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a doctor profile
   * @route DELETE /api/doctors/:id
   */
  async deleteDoctor(req, res, next) {
    try {
      const doctor = await doctorService.deleteDoctor(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Doctor deleted successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DoctorController();
