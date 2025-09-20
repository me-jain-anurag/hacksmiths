import { searchNamaste } from '../services/namasteService.js';
import { searchICD } from '../services/icdService.js';
import { saveCondition, saveAudit } from '../services/fhirService.js';

export const searchController = async (req, res) => {
  try {
    const { patientId, query } = req.body;
    const doctorId = req.abhaUser.hprId; // from ABHA token

    // 1. Search NAMASTE
    const namasteResult = await searchNamaste(query);

    // 2. Search ICD
    const icdResult = await searchICD(namasteResult.code);

    // 3. Save to HAPI FHIR
    const conditionRef = await saveCondition(patientId, doctorId, namasteResult, icdResult);
    const auditRef = await saveAudit(patientId, doctorId, conditionRef);

    // 4. Return response
    res.json({
      status: 'success',
      patientId,
      doctorId,
      namaste: namasteResult,
      icd11: icdResult,
      fhirReferences: {
        condition: conditionRef,
        auditEvent: auditRef
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
