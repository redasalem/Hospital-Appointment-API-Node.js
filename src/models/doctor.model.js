const mongoose = require('mongoose');

/**
 * Sub-schema representing working schedule slots for a doctor
 */
const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'Day of the week is required'],
      enum: {
        values: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        message: '{VALUE} is not a valid weekday',
      },
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Start time must be in HH:mm format (e.g. 09:00)',
      ],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'End time must be in HH:mm format (e.g. 17:00)',
      ],
    },
  },
  { _id: false }
);

/**
 * Main Doctor Schema
 */
const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Doctor name must be at least 2 characters long'],
      maxlength: [100, 'Doctor name cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    workingHours: {
      type: [workingHourSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize filtering by specialization and active status
doctorSchema.index({ specialization: 1, isActive: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
