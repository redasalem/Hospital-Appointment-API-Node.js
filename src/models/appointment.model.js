const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Patient is required'], index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: [true, 'Doctor is required'], index: true },
    startsAt: { type: Date, required: [true, 'Start time is required'] },
    endsAt: { type: Date, required: [true, 'End time is required'] },
    reason: { type: String, required: [true, 'Reason is required'], trim: true, maxlength: [1000, 'Reason cannot exceed 1000 characters'] },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending', index: true },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctor: 1, startsAt: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['Pending', 'Confirmed'] } } }
);
appointmentSchema.index({ patient: 1, startsAt: -1, _id: -1 });
appointmentSchema.index({ doctor: 1, startsAt: -1, _id: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
