const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
           return res.status(400).send('No file uploaded');
        }
        res.send(`/${req.file.path.replace(/\\/g, '/')}`);
    } catch (err) {
        res.status(400).send('Error uploading file');
    }
});

module.exports = router;
