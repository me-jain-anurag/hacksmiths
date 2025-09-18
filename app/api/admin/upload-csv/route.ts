import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempFilePath = path.join(process.cwd(), 'hapi-loader', 'temp_namaste_upload.csv');
    await writeFile(tempFilePath, buffer);
    console.log(`File saved temporarily to: ${tempFilePath}`);

    const hapiLoaderPath = path.join(process.cwd(), 'hapi-loader');

    console.log('Starting: Convert CSV to FHIR...');
    await execAsync(`node scripts/csv-to-fhir.js ${tempFilePath}`, { cwd: hapiLoaderPath });

    console.log('Starting: Load FHIR resources to HAPI server...');
    await execAsync('node scripts/load-to-hapi.js', { cwd: hapiLoaderPath });

    return NextResponse.json({ success: true, message: 'File processed and loaded to HAPI FHIR server successfully.' });

  } catch (error: any) {
    console.error('File upload and processing error:', error);
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 });
  }
}