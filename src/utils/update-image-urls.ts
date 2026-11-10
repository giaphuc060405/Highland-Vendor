/**
 * One-time migration script: updates image_url in the products table
 * from .jpg → .webp to match the files already converted in Supabase Storage.
 *
 * Run with: npx tsx src/utils/update-image-urls.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function updateImageUrls() {
  console.log('Fetching products with .jpg image URLs...');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, image_url')
    .like('image_url', '%.jpg');

  if (error) {
    console.error('Error fetching products:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No products with .jpg URLs found — already up to date!');
    return;
  }

  console.log(`Found ${products.length} product(s) to update.\n`);

  for (const product of products) {
    const newUrl = product.image_url.replace(/\.jpg$/i, '.webp');

    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: newUrl })
      .eq('id', product.id);

    if (updateError) {
      console.error(`✗ Failed to update product ${product.id}:`, updateError.message);
    } else {
      console.log(`✓ Updated: ${product.image_url} → ${newUrl}`);
    }
  }

  console.log('\nDone!');
}

updateImageUrls();
