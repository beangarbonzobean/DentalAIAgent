/**
 * Sample Mock Data
 * For testing crown work order system without database connection
 * 
 * Day 3 - Task 4: Testing
 */

import {
  PatientInfo,
  ProcedureInfo,
  ProviderInfo,
  CrownSpecs,
  CrownWorkOrder,
  DEFAULT_PRACTICE_INFO,
  DEFAULT_CERAMILL_WORKFLOW,
  generateWorkOrderNumber,
  calculateAge
} from '../src/types/crownWorkOrder.js';

// ============================================
// MOCK PROVIDERS
// ============================================

export const mockProviders: ProviderInfo[] = [
  {
    id: 1,
    name: 'Dr. Ben Young',
    abbr: 'BY'
  },
  {
    id: 2,
    name: 'Dr. Sarah Johnson',
    abbr: 'SJ'
  }
];

// ============================================
// MOCK PATIENTS
// ============================================

export const mockPatients: PatientInfo[] = [
  {
    id: 1001,
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1975-03-15'),
    age: calculateAge(new Date('1975-03-15')),
    chartNumber: 'JS-1001'
  },
  {
    id: 1002,
    name: 'Mary Johnson',
    firstName: 'Mary',
    lastName: 'Johnson',
    dateOfBirth: new Date('1982-07-22'),
    age: calculateAge(new Date('1982-07-22')),
    chartNumber: 'MJ-1002'
  },
  {
    id: 1003,
    name: 'Robert Williams',
    firstName: 'Robert',
    lastName: 'Williams',
    dateOfBirth: new Date('1968-11-30'),
    age: calculateAge(new Date('1968-11-30')),
    chartNumber: 'RW-1003'
  },
  {
    id: 1004,
    name: 'Jennifer Davis',
    firstName: 'Jennifer',
    lastName: 'Davis',
    dateOfBirth: new Date('1990-05-18'),
    age: calculateAge(new Date('1990-05-18')),
    chartNumber: 'JD-1004'
  }
];

// ============================================
// MOCK PROCEDURES
// ============================================

export const mockProcedures: ProcedureInfo[] = [
  {
    id: 5001,
    code: 'D2740',
    description: 'Crown - porcelain/ceramic substrate',
    toothNumber: '14',
    procedureDate: new Date(),
    provider: mockProviders[0],
    status: 'C'
  },
  {
    id: 5002,
    code: 'D2750',
    description: 'Crown - porcelain fused to high noble metal',
    toothNumber: '3',
    procedureDate: new Date(),
    provider: mockProviders[0],
    status: 'C'
  },
  {
    id: 5003,
    code: 'D2740',
    description: 'Crown - porcelain/ceramic substrate',
    toothNumber: '19',
    procedureDate: new Date(),
    provider: mockProviders[1],
    status: 'C'
  },
  {
    id: 5004,
    code: 'D2752',
    description: 'Crown - porcelain fused to noble metal',
    toothNumber: '30',
    procedureDate: new Date(),
    provider: mockProviders[0],
    status: 'TP'
  }
];

// ============================================
// MOCK CROWN SPECS
// ============================================

export const mockCrownSpecs: CrownSpecs[] = [
  {
    material: 'Zirconia',
    shade: 'A2',
    shadeSystem: 'Vita Classical',
    prepType: 'Full Crown',
    margin: 'Chamfer',
    occlusion: 'Normal',
    contacts: 'Normal',
    contour: 'Anatomical'
  },
  {
    material: 'E-max',
    shade: 'A3',
    shadeSystem: 'Vita Classical',
    prepType: 'Full Crown',
    margin: 'Shoulder',
    occlusion: 'Light',
    contacts: 'Normal',
    contour: 'Reduced'
  },
  {
    material: 'Porcelain Fused to Metal',
    shade: 'B2',
    shadeSystem: 'Vita Classical',
    prepType: 'Full Crown',
    margin: 'Chamfer',
    occlusion: 'Heavy',
    contacts: 'Heavy',
    contour: 'Full'
  }
];

// ============================================
// MOCK WORK ORDERS
// ============================================

export function createMockWorkOrder(
  patientIndex: number = 0,
  procedureIndex: number = 0,
  specsIndex: number = 0
): CrownWorkOrder {
  const patient = mockPatients[patientIndex % mockPatients.length];
  const procedure = mockProcedures[procedureIndex % mockProcedures.length];
  const specs = mockCrownSpecs[specsIndex % mockCrownSpecs.length];

  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    workOrderNumber: generateWorkOrderNumber(),
    openDentalPatientId: patient.id,
    openDentalProcedureId: procedure.id,
    practice: DEFAULT_PRACTICE_INFO,
    patient,
    procedure,
    crownSpecs: specs,
    ceramillWorkflow: DEFAULT_CERAMILL_WORKFLOW,
    assignedTo: 'Lab Tech',
    specialInstructions: 'Please ensure proper occlusion and contacts',
    clinicalNotes: 'Patient has high smile line. Aesthetics are important.',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(),
        updatedBy: 'System',
        notes: 'Work order created'
      }
    ],
    priority: 'routine'
  };
}

// ============================================
// SAMPLE WORK ORDERS
// ============================================

export const sampleWorkOrder1: CrownWorkOrder = {
  id: 'sample-001',
  workOrderNumber: 'CWO-20251026-001',
  openDentalPatientId: mockPatients[0].id,
  openDentalProcedureId: mockProcedures[0].id,
  practice: DEFAULT_PRACTICE_INFO,
  patient: mockPatients[0],
  procedure: mockProcedures[0],
  crownSpecs: mockCrownSpecs[0],
  ceramillWorkflow: DEFAULT_CERAMILL_WORKFLOW,
  assignedTo: 'Lab Tech',
  specialInstructions: 'Rush case - patient appointment tomorrow',
  clinicalNotes: 'Anterior tooth. Patient wants natural appearance matching adjacent teeth.',
  createdAt: new Date('2025-10-26T10:30:00'),
  updatedAt: new Date('2025-10-26T10:30:00'),
  dueDate: new Date('2025-10-27T14:00:00'),
  status: 'pending',
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date('2025-10-26T10:30:00'),
      updatedBy: 'Dr. Ben Young',
      notes: 'Work order created for same-day crown'
    }
  ],
  priority: 'asap'
};

export const sampleWorkOrder2: CrownWorkOrder = {
  id: 'sample-002',
  workOrderNumber: 'CWO-20251026-002',
  openDentalPatientId: mockPatients[1].id,
  openDentalProcedureId: mockProcedures[1].id,
  practice: DEFAULT_PRACTICE_INFO,
  patient: mockPatients[1],
  procedure: mockProcedures[1],
  crownSpecs: mockCrownSpecs[1],
  ceramillWorkflow: DEFAULT_CERAMILL_WORKFLOW,
  assignedTo: 'Lab Tech',
  specialInstructions: undefined,
  clinicalNotes: 'Standard PFM crown for molar. Function over aesthetics.',
  createdAt: new Date('2025-10-26T11:15:00'),
  updatedAt: new Date('2025-10-26T11:15:00'),
  dueDate: new Date('2025-10-30T09:00:00'),
  status: 'scanned',
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date('2025-10-26T11:15:00'),
      updatedBy: 'Dr. Ben Young',
      notes: 'Work order created'
    },
    {
      status: 'scanned',
      timestamp: new Date('2025-10-26T11:45:00'),
      updatedBy: 'Lab Tech',
      notes: 'Intraoral scan completed with Medit i900'
    }
  ],
  priority: 'routine'
};

export const sampleWorkOrder3: CrownWorkOrder = {
  id: 'sample-003',
  workOrderNumber: 'CWO-20251026-003',
  openDentalPatientId: mockPatients[2].id,
  openDentalProcedureId: mockProcedures[2].id,
  practice: DEFAULT_PRACTICE_INFO,
  patient: mockPatients[2],
  procedure: mockProcedures[2],
  crownSpecs: mockCrownSpecs[2],
  ceramillWorkflow: {
    ...DEFAULT_CERAMILL_WORKFLOW,
    blockType: 'Zirconia 98mm',
    blockShade: 'A2',
    estimatedMillTime: 45
  },
  assignedTo: 'Lab Tech',
  specialInstructions: 'Patient is bruxer. Ensure adequate thickness.',
  clinicalNotes: 'Heavy occlusion. Patient grinds teeth at night.',
  labNotes: 'Using full zirconia for strength. Extra thickness on occlusal surface.',
  createdAt: new Date('2025-10-25T14:00:00'),
  updatedAt: new Date('2025-10-26T09:30:00'),
  dueDate: new Date('2025-10-28T10:00:00'),
  status: 'milling',
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date('2025-10-25T14:00:00'),
      updatedBy: 'Dr. Sarah Johnson',
      notes: 'Work order created'
    },
    {
      status: 'scanned',
      timestamp: new Date('2025-10-25T14:30:00'),
      updatedBy: 'Lab Tech',
      notes: 'Scan completed'
    },
    {
      status: 'designed',
      timestamp: new Date('2025-10-25T15:15:00'),
      updatedBy: 'Lab Tech',
      notes: 'Design completed in Ceramill Mind. Extra thickness added for bruxer.'
    },
    {
      status: 'milling',
      timestamp: new Date('2025-10-26T09:30:00'),
      updatedBy: 'Lab Tech',
      notes: 'Milling started on Ceramill Motion 2'
    }
  ],
  priority: 'urgent'
};

// ============================================
// EXPORT ALL SAMPLES
// ============================================

export const allSampleWorkOrders = [
  sampleWorkOrder1,
  sampleWorkOrder2,
  sampleWorkOrder3
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get random mock patient
 */
export function getRandomPatient(): PatientInfo {
  return mockPatients[Math.floor(Math.random() * mockPatients.length)];
}

/**
 * Get random mock procedure
 */
export function getRandomProcedure(): ProcedureInfo {
  return mockProcedures[Math.floor(Math.random() * mockProcedures.length)];
}

/**
 * Get random mock crown specs
 */
export function getRandomCrownSpecs(): CrownSpecs {
  return mockCrownSpecs[Math.floor(Math.random() * mockCrownSpecs.length)];
}

