import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const searchICD = async (namasteCode) => {
  try {
    // Mock mapping: NAMASTE_1023 -> ICD DD91.1
    const icdMapping = {
      'NAMASTE_1023': { code: 'DD91.1', title: 'Functional dyspepsia', definition: 'A disorder with symptoms of epigastric pain or burning...' }
    };

    return icdMapping[namasteCode] || { code: 'UNKNOWN', title: 'Not Found', definition: '' };
  } catch (err) {
    console.error(err);
    throw new Error('ICD lookup failed');
  }
};
