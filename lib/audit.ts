// lib/audit.ts
import { prisma } from "./prisma";

export async function logAuditEvent({
  action,
  outcome,
  ipAddress,
  clientId,
  doctorId,
  queryTerm,
  namasteCode,
  icdCode,
  fhirEvent,
}: {
  action: string;
  outcome: string;
  ipAddress?: string;
  clientId?: string;
  doctorId?: string;
  queryTerm?: string;
  namasteCode?: string;
  icdCode?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fhirEvent: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        outcome,
        ipAddress,
        clientId,
        doctorId,
        queryTerm,
        namasteCode,
        icdCode,
        fhirEvent,
      },
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

/**
 * Create a FHIR AuditEvent resource for compliance
 */
export function createFhirAuditEvent(data: {
  action: string;
  outcome: 'success' | 'error';
  queryTerm?: string;
  clientId?: string;
  doctorId?: string;
}): object {
  const timestamp = new Date().toISOString();
  
  return {
    resourceType: 'AuditEvent',
    type: {
      system: 'http://terminology.hl7.org/CodeSystem/audit-event-type',
      code: 'rest',
      display: 'RESTful Operation'
    },
    subtype: [
      {
        system: 'http://hl7.org/fhir/restful-interaction',
        code: 'search',
        display: 'search'
      }
    ],
    action: 'E', // Execute
    recorded: timestamp,
    outcome: data.outcome === 'success' ? '0' : '4', // Success or Minor failure
    outcomeDesc: data.outcome === 'success' ? 'Success' : 'Error',
    agent: [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'AUT',
              display: 'Author'
            }
          ]
        },
        who: {
          identifier: {
            value: data.doctorId || data.clientId || 'unknown'
          }
        },
        requestor: true
      }
    ],
    source: {
      site: 'Terminology Service',
      observer: {
        display: 'AYUSH Terminology API'
      },
      type: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/security-source-type',
          code: '4',
          display: 'Application Server'
        }
      ]
    },
    entity: data.queryTerm ? [
      {
        what: {
          identifier: {
            value: data.queryTerm
          }
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object'
        },
        role: {
          system: 'http://terminology.hl7.org/CodeSystem/object-role',
          code: '24',
          display: 'Query'
        }
      }
    ] : undefined
  };
}