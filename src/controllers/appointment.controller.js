const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const ApiError = require('../utils/apiError');
const {
  APPOINTMENT_DURATION,
  isFuture,
  addMinutes,
  isInWorkingHours,
  canDoctorChangeStatus,
  canPatientCancel,
} = require('../utils/appointment-rules');

function hasSameId(firstId, secondId) {
  return String(firstId) === String(secondId);
}

async function findAllowedAppointment(appointmentId, user) {
  const appointment = await Appointment.findById(appointmentId).lean();

  if (!appointment) {
    throw new ApiError('Appointment not found', 404);
  }

  const patientOwnsAppointment = user.role === 'patient' && hasSameId(appointment.patient, user.id);
  const doctorProfile = user.role === 'doctor' ? await Doctor.findOne({ user: user.id }).select('_id').lean() : null;
  const doctorOwnsAppointment = doctorProfile && hasSameId(appointment.doctor, doctorProfile._id);
  const isAdmin = user.role === 'admin';

  if (!isAdmin && !patientOwnsAppointment && !doctorOwnsAppointment) {
    throw new ApiError('You are not allowed to access this appointment', 403);
  }

  return appointment;
}

async function getAllAppointments(req, res, next) {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({})
      .sort({ startsAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Appointment.countDocuments({});

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return next(error);
  }
}

async function createAppointment(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.body.doctor).lean();

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    if (!doctor.isActive) {
      throw new ApiError('Doctor is not available', 409);
    }

    const startsAt = new Date(req.body.startsAt);
    const endsAt = addMinutes(startsAt, APPOINTMENT_DURATION);

    if (!isFuture(startsAt)) {
      throw new ApiError('Appointment must be in the future', 400);
    }

    if (!isInWorkingHours(startsAt, endsAt, doctor.workingHours)) {
      throw new ApiError('Appointment is outside doctor working hours', 400);
    }

    if (startsAt.getMinutes() % APPOINTMENT_DURATION !== 0 || startsAt.getSeconds() !== 0 || startsAt.getMilliseconds() !== 0) {
      throw new ApiError('Appointment must start on a 30-minute boundary', 400);
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctor._id,
      startsAt,
      endsAt,
      reason: req.body.reason,
      status: 'Pending',
    });

    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError('This doctor slot is already booked', 409));
    }
    return next(error);
  }
}

async function getMyAppointments(req, res, next) {
  try {
    let filter;
    if (req.user.role === 'patient') filter = { patient: req.user.id };
    else {
      const doctor = await Doctor.findOne({ user: req.user.id }).select('_id').lean();
      if (!doctor) throw new ApiError('No doctor profile is linked to this account', 403);
      filter = { doctor: doctor._id };
    }
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
      .sort({ startsAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAppointmentById(req, res, next) {
  try {
    const appointment = await findAllowedAppointment(req.params.id, req.user);
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return next(error);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const appointment = await findAllowedAppointment(req.params.id, req.user);

    if (!canDoctorChangeStatus(appointment.status, req.body.status)) {
      throw new ApiError('This status change is not allowed', 409);
    }

    appointment.status = req.body.status;
    const updateFields = { status: appointment.status };
    if (appointment.status === 'Cancelled') {
      updateFields.cancelledAt = new Date();
      updateFields.cancelledBy = req.user.id;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    return next(error);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const appointment = await findAllowedAppointment(req.params.id, req.user);

    if (!canPatientCancel(appointment)) {
      throw new ApiError('This appointment cannot be cancelled', 409);
    }

    const cancelledAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Cancelled', cancelledAt: new Date(), cancelledBy: req.user.id } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, data: cancelledAppointment });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
