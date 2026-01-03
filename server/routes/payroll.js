const express = require('express');
const router = express.Router();
const { generatePayslip, getMyPayslips, getAllPayrolls, updatePayrollStatus, deletePayroll } = require('../controllers/payrollController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, generatePayslip);
router.get('/', protect, getMyPayslips);
router.get('/all', protect, admin, getAllPayrolls);
router.put('/:id', protect, admin, updatePayrollStatus);
router.delete('/:id', protect, admin, deletePayroll);

module.exports = router;
