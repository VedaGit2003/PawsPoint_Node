// offlineAppointment.model.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const offlineAppointmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
pincode: {
        type: Number,
        required: [true, "Please enter the pincode"],
      },
  confirmation: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
  },
  finalDate: {
    type: Date
  }
}, {
  timestamps: true
});

const OfflineAppointment = model('OfflineAppointment', offlineAppointmentSchema);

export default OfflineAppointment;
