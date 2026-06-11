import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as unknown as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure dir exists
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
