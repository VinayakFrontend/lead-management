const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/authMiddleware');

// CRUD routes
router.get('/', auth, leadController.getLeads);
router.post('/', auth, leadController.createLead);
router.put('/:id', auth, leadController.updateLead);
router.delete('/:id', auth, leadController.deleteLead);

// Tag routes
router.post('/:id/tags', auth, leadController.addTag);
router.delete('/:id/tags', auth, leadController.removeTag);

// Comment routes
router.post('/:id/comments', auth, leadController.addComment);
router.delete('/:id/comments/:commentId', auth, leadController.deleteComment);

router.get('/:id', auth, leadController.getLeadById); // ⬅️ Add this line

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // temp folder

router.post('/import', auth, upload.single('file'), leadController.importLeads);

// router.get('/export', auth, leadController.exportLeads);

router.post('/export',  leadController.exportLeadsToExcel);

module.exports = router;
