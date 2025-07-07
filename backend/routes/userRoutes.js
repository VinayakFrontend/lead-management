const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserLogs,
  getSupportAgents
} = require('../controllers/userController');

const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
router.get('/support-agents', auth, getSupportAgents);

router.use(auth, checkRole('super-admin')); // restrict all below routes to super admin

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/logs/:id', getUserLogs);


module.exports = router;
