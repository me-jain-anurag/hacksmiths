// app/api/terminology/search/route.ts
import { NextResponse } from 'next/server';
import { verifyAbhaJwt } from '@/lib/abha';
import { buildRawAndFhirResponseWithHapi } from '@/lib/terminologyHapi';
import { logAuditEvent, createFhirAuditEvent } from '@/lib/audit';
import { authenticateClient } from '@/lib/authenticateClient';

export async function POST(req: Request) {
  let queryTerm = '';
  let patientId = '';
  let claims;
  let client;
  
  try {
    // Step 0: Validate Content-Type header
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'processing', 
          diagnostics: 'Content-Type must be application/json' 
        }] 
      }, { status: 400 });
    }

    // Step 1: Authenticate client using X-API-Key
    try {
      client = await authenticateClient(req);
    } catch (e) {
      const err = e as Error;
      
      // Audit failed client authentication
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
        apiClientId: undefined,
        apiClientName: 'unknown',
      });
      
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'forbidden', 
          diagnostics: `Client authentication failed: ${err.message}` 
        }] 
      }, { status: 403 });
    }

    // Step 2: Verify ABHA JWT token
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
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
        apiClientId: client.id,
        apiClientName: client.name,
      });
      
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'processing', 
          diagnostics: 'Missing token' 
        }] 
      }, { status: 401 });
    }

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
        apiClientId: client.id,
        apiClientName: client.name,
      });
      
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'processing', 
          diagnostics: `Unauthorized: ${err.message}` 
        }] 
      }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const query = (body?.query || body?.term || '') as string;
    const patientIdFromBody = body?.patientId as string | undefined;
    queryTerm = query;
    patientId = patientIdFromBody || '';

    if (!query) {
      // Audit missing query
      const fhirEvent = createFhirAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        queryTerm: '',
        clientId: claims?.client_id,
        doctorId: claims?.sub,
        patientId: patientIdFromBody,
      });
      
      await logAuditEvent({
        action: 'terminology.search',
        outcome: 'error',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        clientId: claims?.client_id,
        doctorId: claims?.sub,
        queryTerm: '',
        fhirEvent,
        apiClientId: client.id,
        apiClientName: client.name,
      });
      
      return NextResponse.json({ 
        resourceType: 'OperationOutcome', 
        issue: [{ 
          severity: 'error', 
          code: 'processing', 
          diagnostics: 'Missing required "query" field' 
        }] 
      }, { status: 400 });
    }

    const result = await buildRawAndFhirResponseWithHapi({ query, claims, patientId: patientIdFromBody });

    // Extract codes for audit logging
    const namasteCode = result.rawMapping.find((r: any) => r.system.includes('namaste'))?.code;
    const icdCode = result.rawMapping.find((r: any) => r.system.includes('icd'))?.code;

    // Audit successful search
    const fhirEvent = createFhirAuditEvent({
      action: 'terminology.search',
      outcome: 'success',
      queryTerm: query,
      clientId: claims?.client_id,
      doctorId: claims?.sub,
      patientId: patientIdFromBody,
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
      apiClientId: client.id,
      apiClientName: client.name,
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
      patientId: patientId || undefined,
    });
    
    await logAuditEvent({
      action: 'terminology.search',
      outcome: 'error',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      clientId: claims?.client_id,
      doctorId: claims?.sub,
      queryTerm,
      fhirEvent,
      apiClientId: client?.id,
      apiClientName: client?.name || 'unknown',
    });
    
    // Enhanced error handling: Check for specific error types
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
    return NextResponse.json({ 
      resourceType: 'OperationOutcome', 
      issue: [{ 
        severity: 'error', 
        code: 'exception', 
        diagnostics: 'Internal server error' 
      }] 
    }, { status: 500 });
  }
}
