const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase Storage] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. File uploads will fail.');
} else {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
}

const BUCKET_NAME = 'avatars';

/**
 * Upload a file to Supabase Storage and return the permanent public URL.
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} fileName - Desired file name (e.g. "avatar-1234567890.jpg")
 * @param {string} mimeType - The MIME type of the file (e.g. "image/jpeg")
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadToSupabase = async (fileBuffer, fileName, mimeType) => {
    if (!supabase) {
        throw new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    const filePath = `profiles/${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: true // Overwrite if same filename exists
        });

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get the permanent public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
};

module.exports = { uploadToSupabase };
