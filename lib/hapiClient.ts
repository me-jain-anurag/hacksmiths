// lib/hapiClient.ts
// Client library for HAPI FHIR terminology operations

export interface HapiConfig {
  baseUrl: string;
  timeout?: number;
}

export interface TranslateParams {
  code: string;
  system: string;
  target?: string;
  conceptMapUrl?: string;
}

export interface LookupParams {
  code: string;
  system: string;
}

export interface ValidateCodeParams {
  code: string;
  system: string;
  display?: string;
}

export class HapiTerminologyClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: HapiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
  }

  /**
   * Translate a code using ConceptMap/$translate operation
   */
  async translate(params: TranslateParams): Promise<any> {
    const url = `${this.baseUrl}/ConceptMap/$translate`;
    
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: params.code },
        { name: 'system', valueUri: params.system }
      ]
    };

    if (params.target) {
      body.parameter.push({ name: 'target', valueUri: params.target });
    }

    if (params.conceptMapUrl) {
      body.parameter.push({ name: 'url', valueUri: params.conceptMapUrl });
    }

    const result = await this.makeRequest(url, 'POST', body);
    console.log('🔄 HAPI $translate response:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Lookup a code using CodeSystem/$lookup operation
   */
  async lookup(params: LookupParams): Promise<any> {
    const url = `${this.baseUrl}/CodeSystem/$lookup`;
    
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: params.code },
        { name: 'system', valueUri: params.system }
      ]
    };

    const result = await this.makeRequest(url, 'POST', body);
    console.log('🔍 HAPI $lookup response:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Validate a code using CodeSystem/$validate-code operation
   */
  async validateCode(params: ValidateCodeParams): Promise<any> {
    const url = `${this.baseUrl}/CodeSystem/$validate-code`;
    
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: params.code },
        { name: 'system', valueUri: params.system }
      ] as any[]
    };

    if (params.display) {
      body.parameter.push({ name: 'display', valueString: params.display });
    }

    return this.makeRequest(url, 'POST', body);
  }

  /**
   * Get ConceptMap by ID
   */
  async getConceptMap(id: string): Promise<any> {
    const url = `${this.baseUrl}/ConceptMap/${id}`;
    return this.makeRequest(url, 'GET');
  }

  /**
   * Get CodeSystem by ID
   */
  async getCodeSystem(id: string): Promise<any> {
    const url = `${this.baseUrl}/CodeSystem/${id}`;
    return this.makeRequest(url, 'GET');
  }

  /**
   * Check if HAPI server is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/metadata`;
      const response = await this.makeRequest(url, 'GET');
      return response.resourceType === 'CapabilityStatement';
    } catch {
      return false;
    }
  }

  private async makeRequest(url: string, method: string, body?: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        },
        signal: controller.signal
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HAPI FHIR API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`HAPI FHIR request timeout (${this.timeout}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Default client instance
export const hapiClient = new HapiTerminologyClient({
  baseUrl: process.env.HAPI_BASE_URL || 'http://localhost:8080/fhir'
});