// app/api/terminology/search/route.ts
import { NextResponse } from 'next/server';
import { verifyAbhaJwt } from '@/lib/abha';
import { buildRawAndFhirResponse } from '@/lib/terminology';
import { logAuditEvent, createFhirAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  let queryTerm = '';
  let claims;
  
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'processing', diagnostics: 'Missing token' }] }, { status: 401 });

    try {
      claims = await verifyAbhaJwt(token, ['terminology/search.read']);
    } catch (e) {
      const err = e as Error;
      
      // Audit failed authentication
      const fhirEvent = createFhirAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        queryTerm: '',
        clientId: undefined,
        doctorId: undefined,
      });
      
      await logAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        queryTerm: '',
        fhirEvent,
      });
      
      return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'processing', diagnostics: `Unauthorized: ${err.message}` }] }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const query = (body?.query || body?.term || '') as string;
    const patientId = body?.patientId as string | undefined;
    queryTerm = query;

    if (!query) {
      // Audit missing query
      const fhirEvent = createFhirAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        queryTerm: '',
        clientId: claims?.client_id,
        doctorId: claims?.sub,
      });
      
      await logAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        clientId: claims?.client_id,
        doctorId: claims?.sub,
        queryTerm: '',
        fhirEvent,
      });
      
      return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'processing', diagnostics: 'Missing required "query" field' }] }, { status: 400 });
    }

    const result = await buildRawAndFhirResponse({ query, claims, patientId });

    // Extract codes for audit logging
    const namasteCode = result.rawMapping.find(r => r.system.includes('namaste'))?.code;
    const icdCode = result.rawMapping.find(r => r.system.includes('icd'))?.code;

    // Audit successful search
    const fhirEvent = createFhirAuditEvent({
      action: 'terminology.search',
      outcome: 'success',
      queryTerm: query,
      clientId: claims?.client_id,
      doctorId: claims?.sub,
    });
    
    await logAuditEvent({
      action: 'terminology.search',
      outcome: 'success',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      clientId: claims?.client_id,
      doctorId: claims?.sub,
      queryTerm: query,
      namasteCode,
      icdCode,
      fhirEvent,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    const error = err as Error;
    
    // Audit error cases
    const fhirEvent = createFhirAuditEvent({
      action: 'terminology.search',
      outcome: 'error',
      queryTerm,
      clientId: claims?.client_id,
      doctorId: claims?.sub,
    });
    
    await logAuditEvent({
      action: 'terminology.search',
      outcome: 'error',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      clientId: claims?.client_id,
      doctorId: claims?.sub,
      queryTerm,
      fhirEvent,
    });
    
    // Enhanced error handling: Check for specific error types
    if (error.message && error.message.includes('Query not found in CSV dataset:')) {
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'not-found', 
          diagnostics: error.message 
        }] 
      }, { status: 404 });
    }
    
    if (error.message && error.message.includes('No NAMASTE code exists for query:')) {
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'not-found', 
          diagnostics: error.message 
        }] 
      }, { status: 404 });
    }
    
    // Legacy error handling for backward compatibility
    if (error.message && error.message.includes('No ICD-11 mapping found for query:')) {
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'not-found', 
          diagnostics: error.message 
        }] 
      }, { status: 404 });
    }
    
    // Generic server error
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal server error' }] }, { status: 500 });
  }
}
