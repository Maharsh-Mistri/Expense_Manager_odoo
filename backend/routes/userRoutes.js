 const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', protect, getUsers);
router.post('/', protect, checkRole('Admin'), createUser);
router.put('/:id', protect, checkRole('Admin'), updateUser);
router.delete('/:id', protect, checkRole('Admin'), deleteUser);

module.exports = router;

