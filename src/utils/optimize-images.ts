import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Use service role key to bypass RLS for admin operations (upload/delete)
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
  console.log('Đang quét danh sách ảnh trong bucket...');

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { limit: 500, offset: 0 });

  if (listError) {
    console.error('Lỗi lấy danh sách file:', listError.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log('Không tìm thấy file nào.');
    return;
  }

  for (const file of files) {
    // Bỏ qua các file ẩn, thư mục hệ thống hoặc file đã là webp
    if (file.name.startsWith('.') || file.name.endsWith('.webp')) {
      console.log(`Bỏ qua file (đã là webp hoặc hệ thống): ${file.name}`);
      continue;
    }

    console.log(`\nĐang xử lý và ghi đè: ${file.name}`);

    // 1. Tải ảnh gốc từ Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(file.name);

    if (downloadError || !fileData) {
      console.error(`-> Lỗi tải file ${file.name}:`, downloadError?.message);
      continue;
    }

    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // 2. Xử lý ảnh bằng Sharp: Resize về kích thước chuẩn và chuyển sang WebP
      const processedBuffer = await sharp(inputBuffer)
        .resize({ 
          width: TARGET_WIDTH, 
          withoutEnlargement: true // Không phóng to nếu ảnh gốc nhỏ hơn
        })
        .webp({ quality: 80 }) // Nén chất lượng 80% tối ưu dung lượng
        .toBuffer();

      // Lấy tên gốc không kèm phần mở rộng (ví dụ: "tho-cam.jpg" -> "tho-cam")
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const newFileName = `${baseName}.webp`; // Đổi đuôi thành .webp

      // 3. Đẩy file WebP mới lên Supabase với tuỳ chọn `upsert: true` để GHI ĐÈ file cũ
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(newFileName, processedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // Cache 1 năm theo yêu cầu PageSpeed
          upsert: true,             // Cho phép ghi đè tệp cũ
        });

      if (uploadError) {
        console.error(`-> Lỗi upload ghi đè ${newFileName}:`, uploadError.message);
      } else {
        console.log(`-> Thành công! Đã thay thế bằng file WebP mới: ${newFileName}`);

        
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([file.name]);
        if (!deleteError) console.log(`-> Đã xóa file gốc cũ: ${file.name}`);
      }

    } catch (err: any) {
      console.error(`-> Lỗi xử lý sharp cho ${file.name}:`, err.message);
    }
  }

  console.log('\nHoàn tất quá trình tối ưu và ghi đè ảnh!');
}

optimizeAndOverwriteImages();