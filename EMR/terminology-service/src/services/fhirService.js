import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export const saveCondition = async (patientId, doctorId, namaste, icd) => {
  const condition = {
    resourceType: 'Condition',
    id: uuidv4(),
    subject: { reference: `Patient/${patientId}` },
    asserter: { reference: `Practitioner/${doctorId}` },
    code: {
      coding: [
        { system: 'http://ayush.gov.in/fhir/namaste', code: namaste.code, display: namaste.term },
        { system: 'http://id.who.int/icd/release/11/mms', code: icd.code, display: icd.title }
      ]
    },
    recordedDate: new Date().toISOString(),
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
    }
  };

  const response = await axios.post(`${process.env.HAPI_BASE_URL}/Condition`, condition);
  return `Condition/${response.data.id}`;
};

export const saveAudit = async (patientId, doctorId, conditionRef) => {
  const audit = {
    resourceType: 'AuditEvent',
    id: uuidv4(),
    type: { code: 'rest' },
    action: 'E',
    recorded: new Date().toISOString(),
    outcome: '0',
    agent: [
      { who: { reference: `Practitioner/${doctorId}` }, requestor: true },
      { who: { reference: 'Organization/EMR' } }
    ],
    source: { observer: { reference: process.env.HAPI_BASE_URL } },
    entity: [{ what: { reference: conditionRef } }]
  };

  const response = await axios.post(`${process.env.HAPI_BASE_URL}/AuditEvent`, audit);
  return `AuditEvent/${response.data.id}`;
};
