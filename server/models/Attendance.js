const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // Normalized to midnight or simple date string
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Half-day', 'Leave'], 
        default: 'Absent' 
    },
    workHours: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
