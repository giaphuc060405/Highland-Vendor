import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Thiếu VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});


const BUCKET_NAME = 'product-images';


const TARGET_WIDTH = 400; 

async function optimizeAndOverwriteImages() {
  console.log('Scanning the images in the bucket...');

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { limit: 500, offset: 0 });

  if (listError) {
    console.error('An Error has been occurred:', listError.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log('Found no images in the bucket...');
    return;
  }

  for (const file of files) {
    // Bỏ qua các file ẩn, thư mục hệ thống hoặc file đã là webp
    if (file.name.startsWith('.') || file.name.endsWith('.webp')) {
      console.log(`Skipping files: ${file.name}`);
      continue;
    }

    console.log(`\nHandling and Overwriting: ${file.name}`);


    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(file.name);

    if (downloadError || !fileData) {
      console.error(`-> Error loading file ${file.name}:`, downloadError?.message);
      continue;
    }

    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      const processedBuffer = await sharp(inputBuffer)
        .resize({ 
          width: TARGET_WIDTH, 
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const newFileName = `${baseName}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(newFileName, processedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError) {
        console.error(`-> Error overwriting ${newFileName}:`, uploadError.message);
      } else {
        console.log(`-> Replaced the file with WEBP: ${newFileName}`);
        
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([file.name]);
        if (!deleteError) console.log(`-> Deleted the old file: ${file.name}`);
      }

    } catch (err: any) {
      console.error(`-> Sharp handling error for ${file.name}:`, err.message);
    }
  }

  console.log('\nThe process has been completed!');
}

optimizeAndOverwriteImages();