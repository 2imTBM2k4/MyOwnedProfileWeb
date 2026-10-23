import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SECRET_KEY.');
const { storage } = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await storage.getBucket('cvs');
if (data) {
  if (data.public) throw new Error('The cvs bucket must be private. Change its access setting before continuing.');
  console.log('CV storage is ready (existing private cvs bucket).');
} else if (error && ['400', '404'].includes(String(error.statusCode)) && /not found|does not exist/i.test(error.message)) {
  const result = await storage.createBucket('cvs', { public: false, fileSizeLimit: 4 * 1024 * 1024, allowedMimeTypes: ['application/pdf'] });
  if (result.error) throw new Error(result.error.message);
  console.log('Created private cvs bucket (PDF only, maximum 4 MB).');
} else {
  throw new Error(error?.message || 'Cannot inspect cvs storage.');
}
