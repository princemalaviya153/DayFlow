const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadToSupabase, deleteFromSupabase } = require('../config/supabaseStorage');

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate a unique filename
        const ext = req.file.originalname.split('.').pop();
        const fileName = `avatar-${Date.now()}.${ext}`;

        // Upload to Supabase Storage and get the public URL
        const publicUrl = await uploadToSupabase(req.file.buffer, fileName, req.file.mimetype);

        res.json({ url: publicUrl });
    } catch (err) {
        console.error('[Upload Error]', err.message);
        res.status(500).json({ message: err.message || 'Error uploading file' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'No file URL provided' });
        }

        await deleteFromSupabase(url);
        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('[Delete Error]', err.message);
        res.status(500).json({ message: err.message || 'Error deleting file' });
    }
});

module.exports = router;
