// lib/terminologyHapi.ts
// Standards-based terminology service using HAPI FHIR server

import { hapiClient } from './hapiClient';
import { loadNamasteDataSync, type NormalizedRow } from './namasteLoader';
import type { AbhaClaims } from './abha';

export interface TerminologySearchParams {
  query: string;
  claims: AbhaClaims;
  patientId?: string;
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

/**
 * Standards-based terminology search using HAPI FHIR
 */
export async function buildRawAndFhirResponseWithHapi(params: TerminologySearchParams): Promise<TerminologyResponse> {
  const { query, patientId, maxResults = 10 } = params;
  const q = (query || '').trim();
  if (!q) throw new Error('Missing query');

  // Check HAPI server availability
  const isHapiAvailable = await hapiClient.healthCheck();
  if (!isHapiAvailable) {
    console.warn('🔧 HAPI FHIR server not available, falling back to direct CSV search');
    // Fallback to original implementation
    return buildRawAndFhirResponseFallback(params);
  }

  try {
    // Step 1: Find NAMASTE codes from CSV for initial search
    // (This will be replaced with HAPI search in the future)
    const data: NormalizedRow[] = loadNamasteDataSync();
    const csvMatches = data.filter((row) => {
      if (row.namaste_term && row.namaste_term.toLowerCase().includes(q.toLowerCase())) {
        return true;
      }
      if (row.namaste_code && row.namaste_code.toLowerCase() === q.toLowerCase()) {
        return true;
      }
      if (row.icd11_title && row.icd11_title.toLowerCase().includes(q.toLowerCase())) {
        return true;
      }
      return false;
    }).slice(0, maxResults);

    if (csvMatches.length === 0) {
      // Return NOT_MAPPED response instead of throwing error
      console.log(`⚠️ Query not found in CSV dataset: ${query} - returning NOT_MAPPED response`);
      return buildNotMappedResponse(query, patientId);
    }

    const namasteMatches = csvMatches.filter(match => match.namaste_code && match.namaste_term);
    if (namasteMatches.length === 0) {
      // Return NOT_MAPPED response instead of throwing error
      console.log(`⚠️ No NAMASTE code exists for query: ${query} - returning NOT_MAPPED response`);
      return buildNotMappedResponse(query, patientId);
    }

    // Step 2: Use HAPI FHIR operations for standards-based terminology
    const rawMapping: RawMapping[] = [];
    const primary = namasteMatches[0];

    // Step 2a: Use $lookup operation to get NAMASTE term details
    console.log(`🔍 HAPI $lookup: ${primary.namaste_code}`);
    const lookupResult = await hapiClient.lookup({
      code: primary.namaste_code!,
      system: 'http://ayush.gov.in/fhir/namaste'
    });

    // Parse lookup result
    if (lookupResult.resourceType === 'Parameters' && lookupResult.parameter) {
      const displayParam = lookupResult.parameter.find((p: any) => p.name === 'display');
      const nameParam = lookupResult.parameter.find((p: any) => p.name === 'name');
      
      const display = displayParam?.valueString || nameParam?.valueString || primary.namaste_term;
      
      rawMapping.push({
        term: display,
        code: primary.namaste_code!,
        system: "http://ayush.gov.in/fhir/namaste",
        display: display,
        mappingStatus: 'MAPPED'
      });

      console.log(`✅ HAPI $lookup successful: ${display}`);
    } else {
      // Fallback to CSV data
      rawMapping.push({
        term: primary.namaste_term!,
        code: primary.namaste_code!,
        system: "http://ayush.gov.in/fhir/namaste",
        display: primary.namaste_term!,
        mappingStatus: 'MAPPED'
      });
    }

    // Step 2b: Use $translate operation to get ICD-11 mapping
    console.log(`🔄 HAPI $translate: ${primary.namaste_code} → ICD-11`);
    const translateResult = await hapiClient.translate({
      code: primary.namaste_code!,
      system: 'http://ayush.gov.in/fhir/namaste',
      target: 'http://id.who.int/icd/release/11/mms',
      conceptMapUrl: 'http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11'
    });

    // Parse translation results
    if (translateResult.resourceType === 'Parameters' && translateResult.parameter) {
      const resultParam = translateResult.parameter.find((p: any) => p.name === 'result');
      
      if (resultParam?.valueBoolean === true) {
        const matchParam = translateResult.parameter.find((p: any) => p.name === 'match');
        
        if (matchParam && matchParam.part) {
          const conceptPart = matchParam.part.find((p: any) => p.name === 'concept');
          
          if (conceptPart && conceptPart.valueCoding) {
            const icdCode = conceptPart.valueCoding.code;
            const icdDisplay = conceptPart.valueCoding.display;
            
            rawMapping.push({
              term: icdDisplay,
              code: icdCode,
              system: "http://id.who.int/icd/release/11/mms",
              display: icdDisplay,
              mappingStatus: 'MAPPED'
            });

            console.log(`✅ HAPI $translate successful: ${icdCode} - ${icdDisplay}`);
          }
        }
      } else {
        console.log(`⚠️ HAPI $translate: No ICD-11 mapping found for ${primary.namaste_code}`);
        
        // Update NAMASTE mapping status
        if (rawMapping.length > 0) {
          rawMapping[0].mappingStatus = 'NOT_MAPPED';
        }
      }
    } else {
      console.warn('⚠️ HAPI $translate returned unexpected format, using CSV fallback');
      
      // Fallback to CSV data for ICD mapping
      if (primary.icd11_code && primary.icd11_title) {
        rawMapping.push({
          term: primary.icd11_title,
          code: primary.icd11_code,
          system: "http://id.who.int/icd/release/11/mms",
          display: primary.icd11_title,
          mappingStatus: 'MAPPED'
        });
      } else if (rawMapping.length > 0) {
        rawMapping[0].mappingStatus = 'NOT_MAPPED';
      }
    }

    // Step 3: Build FHIR Condition resource
    const fhir = buildFhirCondition(primary, rawMapping, patientId);

    console.log(`🎉 HAPI-based terminology search completed: ${rawMapping.length} mappings found`);
    return { rawMapping, fhir };

  } catch (error) {
    console.error('❌ HAPI operation failed:', error);
    console.log('🔄 Falling back to CSV-based search');
    
    // Fallback to original CSV implementation
    return buildRawAndFhirResponseFallback(params);
  }
}

/**
 * Fallback to original CSV-based implementation
 */
async function buildRawAndFhirResponseFallback(params: TerminologySearchParams): Promise<TerminologyResponse> {
  // Import the original function to avoid code duplication
  const { buildRawAndFhirResponse } = await import('./terminology');
  return buildRawAndFhirResponse(params);
}

/**
 * Build FHIR Condition resource from mappings
 */
function buildFhirCondition(primary: NormalizedRow, rawMapping: RawMapping[], patientId?: string): FhirResponse {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (crypto as any).randomUUID() : 
    `cond-${Date.now()}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coding: any[] = rawMapping.map(mapping => ({
    system: mapping.system,
    code: mapping.code,
    display: mapping.display,
  }));

  const mappingStatus = rawMapping.some(m => m.system.includes('icd')) ? 'MAPPED' : 'NOT_MAPPED';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extensions: any[] = [{
    url: "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
    valueString: mappingStatus
  }];

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
      text: rawMapping.map(m => m.display).join(' / '),
    },
    recordedDate: new Date().toISOString(),
  };

  if (patientId) {
    condition.subject = { reference: `Patient/${patientId}` };
  }

  // Build response (Bundle if patientId provided, otherwise just Condition)
  if (patientId) {
    const patientStub = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{ system: 'https://healthid.ndhm.gov.in', value: patientId }],
    };

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: patientStub },
        { resource: condition },
      ],
    };
  }

  return condition;
}

/**
 * Build response for unmapped terms
 */
function buildNotMappedResponse(query: string, patientId?: string): TerminologyResponse {
  // Create a generic term entry with NOT_MAPPED status
  const rawMapping: RawMapping[] = [{
    term: query,
    code: 'UNMAPPED',
    system: 'http://ayush.gov.in/fhir/unmapped',
    display: `${query} (No standard mapping found)`,
    mappingStatus: 'NOT_MAPPED'
  }];

  // Build FHIR response
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (crypto as any).randomUUID() : 
    `unmapped-${Date.now()}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const condition: any = {
    resourceType: 'Condition',
    id,
    extension: [{
      url: "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
      valueString: 'NOT_MAPPED'
    }],
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
      coding: [{
        system: 'http://ayush.gov.in/fhir/unmapped',
        code: 'UNMAPPED',
        display: `${query} (No standard mapping found)`,
      }],
      text: `${query} (No standard mapping found)`,
    },
    recordedDate: new Date().toISOString(),
  };

  if (patientId) {
    condition.subject = { reference: `Patient/${patientId}` };

    const patientStub = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{ system: 'https://healthid.ndhm.gov.in', value: patientId }],
    };

    return {
      rawMapping,
      fhir: {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          { resource: patientStub },
          { resource: condition },
        ],
      }
    };
  }

  return {
    rawMapping,
    fhir: condition
  };
}