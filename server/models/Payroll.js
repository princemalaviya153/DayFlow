const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // e.g., "January 2026"
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Paid'], 
        default: 'Pending' 
    },
    paidDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
