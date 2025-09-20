// lib/terminology.ts
import { loadNamasteDataSync, type NormalizedRow } from './namasteLoader';
import type { AbhaClaims } from './abha';

export interface TerminologySearchParams {
  query: string;
  claims: AbhaClaims;
  patientId?: string; // optional - ABHA patient id if EMR provides it
  maxResults?: number;
}

export interface RawMapping {
  term: string;
  code: string;
  system: string;
  display: string;
  mappingStatus?: 'MAPPED' | 'NOT_MAPPED';
}

export interface FhirResponse {
  resourceType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TerminologyResponse {
  rawMapping: RawMapping[];
  fhir: FhirResponse;
}

export async function buildRawAndFhirResponse(params: TerminologySearchParams): Promise<TerminologyResponse> {
  const { query, patientId, maxResults = 10 } = params;
  const q = (query || '').trim();
  if (!q) throw new Error('Missing query');

  // 1) Load CSV data (cached)
  const data: NormalizedRow[] = loadNamasteDataSync();

  // 2) Enhanced search: match against NUMC_TERM (namaste_term)
  const matches = data.filter((row) => {
    // Primary match: exact term match or contains query
    if (row.namaste_term && row.namaste_term.toLowerCase().includes(q.toLowerCase())) {
      return true;
    }
    // Secondary match: code match
    if (row.namaste_code && row.namaste_code.toLowerCase() === q.toLowerCase()) {
      return true;
    }
    // Tertiary match: ICD term match
    if (row.icd11_title && row.icd11_title.toLowerCase().includes(q.toLowerCase())) {
      return true;
    }
    return false;
  }).slice(0, maxResults);

  // Enhanced error handling: If no matches found in CSV, throw error
  if (matches.length === 0) {
    throw new Error(`Query not found in CSV dataset: ${query}`);
  }

  // Check if any matches have NAMASTE codes - if none exist, throw error
  const namasteMatches = matches.filter(match => match.namaste_code && match.namaste_term);
  if (namasteMatches.length === 0) {
    throw new Error(`No NAMASTE code exists for query: ${query}`);
  }

  // 3) Build enhanced rawMapping array with mapping status
  const rawMapping: RawMapping[] = [];
  
  matches.forEach((match) => {
    // Add NAMASTE mapping if available
    if (match.namaste_code && match.namaste_term) {
      rawMapping.push({
        term: match.namaste_term,
        code: match.namaste_code,
        system: "http://ayush.gov.in/fhir/namaste",
        display: match.namaste_term,
        mappingStatus: match.icd11_code ? 'MAPPED' : 'NOT_MAPPED'
      });
    }
    
    // Add ICD-11 mapping if available
    if (match.icd11_code && match.icd11_title) {
      rawMapping.push({
        term: match.icd11_title,
        code: match.icd11_code,
        system: "http://id.who.int/icd/release/11/mms",
        display: match.icd11_title,
        mappingStatus: 'MAPPED'
      });
    }
  });

  // 4) Build enhanced FHIR Condition resource
  const primary = matches[0];

  // Generate an id for the Condition (server-side local id)
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (crypto as any).randomUUID() : 
    `cond-${Date.now()}`;

  // Enhanced coding array - only include available codes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coding: any[] = [];
  
  // Always include NAMASTE code if available (we already validated this exists)
  if (primary?.namaste_code && primary?.namaste_term) {
    coding.push({
      system: 'http://ayush.gov.in/fhir/namaste',
      code: primary.namaste_code,
      display: primary.namaste_term,
    });
  }

  // Only include ICD code if it exists
  if (primary?.icd11_code && primary?.icd11_title) {
    coding.push({
      system: 'http://id.who.int/icd/release/11/mms',
      code: primary.icd11_code,
      display: primary.icd11_title,
    });
  }

  // Determine mapping status for the primary match
  const mappingStatus = primary?.icd11_code ? 'MAPPED' : 'NOT_MAPPED';

  // Build extensions array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extensions: any[] = [];
  
  // Add mapping status extension
  extensions.push({
    url: "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
    valueString: mappingStatus
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const condition: any = {
    resourceType: 'Condition',
    id,
    extension: extensions,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    code: {
      coding,
      text: [primary?.namaste_term, primary?.icd11_title].filter(Boolean).join(' / '),
    },
    recordedDate: new Date().toISOString(),
  };

  if (patientId) {
    condition.subject = { reference: `Patient/${patientId}` };
  }

  // 5) Build FHIR response (Bundle if patientId provided, otherwise just Condition)
  let fhir: FhirResponse;
  if (patientId) {
    // Minimal patient stub
    const patientStub = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{ system: 'https://healthid.ndhm.gov.in', value: patientId }],
    };

    fhir = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: patientStub },
        { resource: condition },
      ],
    };
  } else {
    fhir = condition;
  }

  return { rawMapping, fhir };
}
