import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import csv from 'csv-parser';
import { clearCache } from '../../../../lib/namasteLoader';

const execAsync = promisify(exec);
const REQUIRED_COLUMNS = ['NAMASTE_CODE', 'NAMASTE_DISPLAY', 'ICD11_CODE', 'ICD11_DISPLAY'];

async function validateCsvHeaders(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath).pipe(csv());
    
    stream.on('headers', (headers: string[]) => {
      stream.destroy();
      const hasAllColumns = REQUIRED_COLUMNS.every(col => headers.includes(col));
      if (hasAllColumns) {
        resolve(true);
      } else {
        const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        reject(new Error(`Validation failed: CSV is missing required columns: ${missing.join(', ')}`));
      }
    });

    stream.on('error', (error: any) => { // Corrected type
      reject(error);
    });
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tempFilePath = path.join(process.cwd(), 'hapi-loader', `temp_upload_${Date.now()}.csv`);
  const dataFilePath = path.join(process.cwd(), 'app', 'data', 'Cleaned_data.csv');

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
        return NextResponse.json({ error: 'Invalid file type. Please upload a CSV.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(tempFilePath, buffer);
    console.log(`File saved temporarily to: ${tempFilePath}`);

    await validateCsvHeaders(tempFilePath);
    console.log('CSV headers validated successfully.');

    // Copy uploaded file to the data directory so search can use it
    const dataDir = path.dirname(dataFilePath);
    if (!require('fs').existsSync(dataDir)) {
      await require('fs').promises.mkdir(dataDir, { recursive: true });
    }
    await writeFile(dataFilePath, buffer);
    console.log(`File also saved to data directory: ${dataFilePath}`);

    const hapiLoaderPath = path.join(process.cwd(), 'hapi-loader');

    console.log('Running CSV to FHIR conversion...');
    await execAsync(`node scripts/csv-to-fhir.js "${tempFilePath}"`, { cwd: hapiLoaderPath });
    
    console.log('Loading FHIR resources to HAPI server...');
    await execAsync('node scripts/load-to-hapi.js', { cwd: hapiLoaderPath });

    // Clear the namasteLoader cache so it picks up the new data
    clearCache();
    console.log('Cache cleared - new CSV data will be used for searches');

    return NextResponse.json({ success: true, message: 'File processed and loaded successfully.' });

  } catch (error: any) {
    console.error('File upload processing error:', error);
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 });
  } finally {
    try {
      if (require('fs').existsSync(tempFilePath)) {
        await unlink(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      }
    } catch (cleanupError: any) {
      console.error(`Failed to clean up temporary file ${tempFilePath}:`, cleanupError);
    }
  }
}