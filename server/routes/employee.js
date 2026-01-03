const express = require('express');
const router = express.Router();
const { getEmployees, addEmployee } = require('../controllers/employeeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getEmployees);
router.post('/', protect, admin, addEmployee);

module.exports = router;
