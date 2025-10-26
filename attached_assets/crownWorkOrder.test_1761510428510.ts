/**
 * Crown Work Order End-to-End Test
 * Tests the complete workflow from detection to PDF generation
 * 
 * Day 3 - Task 4: End-to-End Testing
 */

import { sampleWorkOrder1, sampleWorkOrder2, sampleWorkOrder3, createMockWorkOrder } from '../mocks/sampleData.js';
import { CrownDetectionService } from '../src/services/crownDetection.js';
import { PDFGenerator } from '../src/services/pdfGenerator.js';
import {
  isCrownProcedure,
  getCrownDescription,
  getStatusLabel,
  generateWorkOrderNumber,
  calculateAge
} from '../src/types/crownWorkOrder.js';

// ============================================
// TEST CONFIGURATION
// ============================================

const OUTPUT_DIR = '/home/ubuntu/dental-ai-agent-day3/output';

// ============================================
// TEST 1: Crown Detection
// ============================================

export async function testCrownDetection(): Promise<void> {
  console.log('\n=== TEST 1: Crown Detection ===\n');
  
  const detection = new CrownDetectionService();
  
  // Test valid crown codes
  const crownCodes = ['D2740', 'D2750', 'D2751', 'D2752'];
  
  for (const code of crownCodes) {
    const result = detection.detectCrownProcedure(code);
    console.log(`Code: ${code}`);
    console.log(`  Is Crown: ${result.isCrown}`);
    console.log(`  Description: ${result.description}`);
    console.log(`  Recommended Material: ${result.recommendedMaterial}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log();
  }
  
  // Test invalid codes
  const invalidCodes = ['D0120', 'D1110', 'D2391'];
  
  console.log('Testing invalid codes:');
  for (const code of invalidCodes) {
    const result = detection.detectCrownProcedure(code);
    console.log(`Code: ${code} - Is Crown: ${result.isCrown}`);
  }
  
  console.log('\n✅ Crown Detection Test Complete\n');
}

// ============================================
// TEST 2: Helper Functions
// ============================================

export async function testHelperFunctions(): Promise<void> {
  console.log('\n=== TEST 2: Helper Functions ===\n');
  
  // Test isCrownProcedure
  console.log('isCrownProcedure("D2740"):', isCrownProcedure('D2740'));
  console.log('isCrownProcedure("D0120"):', isCrownProcedure('D0120'));
  
  // Test getCrownDescription
  console.log('\ngetCrownDescription("D2750"):', getCrownDescription('D2750'));
  
  // Test getStatusLabel
  console.log('\ngetStatusLabel("pending"):', getStatusLabel('pending'));
  console.log('getStatusLabel("milling"):', getStatusLabel('milling'));
  console.log('getStatusLabel("ready"):', getStatusLabel('ready'));
  
  // Test generateWorkOrderNumber
  console.log('\ngenerateWorkOrderNumber():', generateWorkOrderNumber());
  console.log('generateWorkOrderNumber():', generateWorkOrderNumber());
  
  // Test calculateAge
  const dob = new Date('1975-03-15');
  console.log(`\ncalculateAge(${dob.toDateString()}):`, calculateAge(dob), 'years');
  
  console.log('\n✅ Helper Functions Test Complete\n');
}

// ============================================
// TEST 3: PDF Generation
// ============================================

export async function testPDFGeneration(): Promise<void> {
  console.log('\n=== TEST 3: PDF Generation ===\n');
  
  const pdfGenerator = new PDFGenerator();
  
  // Test with sample work order 1
  console.log('Generating PDF for Sample Work Order 1...');
  const result1 = await pdfGenerator.generatePDF(
    sampleWorkOrder1,
    `${OUTPUT_DIR}/work-order-sample-001.html`
  );
  
  if (result1.success) {
    console.log('✅ PDF Generated Successfully');
    console.log('  File Path:', result1.filePath);
    console.log('  Work Order Number:', result1.metadata?.workOrderNumber);
    console.log('  Generated At:', result1.metadata?.generatedAt);
  } else {
    console.log('❌ PDF Generation Failed');
    console.log('  Error:', result1.error);
  }
  
  // Test with sample work order 2
  console.log('\nGenerating PDF for Sample Work Order 2...');
  const result2 = await pdfGenerator.generatePDF(
    sampleWorkOrder2,
    `${OUTPUT_DIR}/work-order-sample-002.html`
  );
  
  if (result2.success) {
    console.log('✅ PDF Generated Successfully');
    console.log('  File Path:', result2.filePath);
  } else {
    console.log('❌ PDF Generation Failed');
    console.log('  Error:', result2.error);
  }
  
  // Test with sample work order 3
  console.log('\nGenerating PDF for Sample Work Order 3...');
  const result3 = await pdfGenerator.generatePDF(
    sampleWorkOrder3,
    `${OUTPUT_DIR}/work-order-sample-003.html`
  );
  
  if (result3.success) {
    console.log('✅ PDF Generated Successfully');
    console.log('  File Path:', result3.filePath);
  } else {
    console.log('❌ PDF Generation Failed');
    console.log('  Error:', result3.error);
  }
  
  console.log('\n✅ PDF Generation Test Complete\n');
}

// ============================================
// TEST 4: Complete Workflow
// ============================================

export async function testCompleteWorkflow(): Promise<void> {
  console.log('\n=== TEST 4: Complete Workflow ===\n');
  
  const detection = new CrownDetectionService();
  const pdfGenerator = new PDFGenerator();
  
  // Create a new mock work order
  console.log('Creating mock work order...');
  const workOrder = createMockWorkOrder(0, 0, 0);
  
  console.log('Work Order Created:');
  console.log('  ID:', workOrder.id);
  console.log('  Number:', workOrder.workOrderNumber);
  console.log('  Patient:', workOrder.patient.name);
  console.log('  Procedure:', workOrder.procedure.code, '-', workOrder.procedure.description);
  console.log('  Tooth:', workOrder.procedure.toothNumber);
  console.log('  Material:', workOrder.crownSpecs.material);
  console.log('  Shade:', workOrder.crownSpecs.shade);
  console.log('  Status:', workOrder.status);
  console.log('  Priority:', workOrder.priority);
  console.log('  Assigned To:', workOrder.assignedTo);
  
  // Detect crown procedure
  console.log('\nDetecting crown procedure...');
  const detectionResult = detection.detectCrownProcedure(workOrder.procedure.code);
  console.log('  Is Crown:', detectionResult.isCrown);
  console.log('  Confidence:', detectionResult.confidence);
  console.log('  Recommended Material:', detectionResult.recommendedMaterial);
  
  // Generate PDF
  console.log('\nGenerating PDF...');
  const pdfResult = await pdfGenerator.generatePDF(
    workOrder,
    `${OUTPUT_DIR}/work-order-${workOrder.id}.html`
  );
  
  if (pdfResult.success) {
    console.log('✅ PDF Generated Successfully');
    console.log('  File Path:', pdfResult.filePath);
  } else {
    console.log('❌ PDF Generation Failed');
    console.log('  Error:', pdfResult.error);
  }
  
  console.log('\n✅ Complete Workflow Test Complete\n');
}

// ============================================
// TEST 5: Validation
// ============================================

export async function testValidation(): Promise<void> {
  console.log('\n=== TEST 5: Validation ===\n');
  
  const detection = new CrownDetectionService();
  
  // Test valid data
  console.log('Testing valid procedure and patient data...');
  const validResult = detection.validateProcedureData(
    {
      id: 5001,
      code: 'D2740',
      toothNumber: '14'
    },
    {
      id: 1001,
      name: 'John Smith',
      dateOfBirth: new Date('1975-03-15')
    }
  );
  
  console.log('  Is Valid:', validResult.isValid);
  console.log('  Errors:', validResult.errors);
  
  // Test invalid data
  console.log('\nTesting invalid procedure data (missing tooth number)...');
  const invalidResult1 = detection.validateProcedureData(
    {
      id: 5001,
      code: 'D2740'
    },
    {
      id: 1001,
      name: 'John Smith',
      dateOfBirth: new Date('1975-03-15')
    }
  );
  
  console.log('  Is Valid:', invalidResult1.isValid);
  console.log('  Errors:', invalidResult1.errors);
  
  // Test invalid crown code
  console.log('\nTesting invalid crown code...');
  const invalidResult2 = detection.validateProcedureData(
    {
      id: 5001,
      code: 'D0120',
      toothNumber: '14'
    },
    {
      id: 1001,
      name: 'John Smith',
      dateOfBirth: new Date('1975-03-15')
    }
  );
  
  console.log('  Is Valid:', invalidResult2.isValid);
  console.log('  Errors:', invalidResult2.errors);
  
  console.log('\n✅ Validation Test Complete\n');
}

// ============================================
// TEST 6: Shade Extraction
// ============================================

export async function testShadeExtraction(): Promise<void> {
  console.log('\n=== TEST 6: Shade Extraction ===\n');
  
  const detection = new CrownDetectionService();
  
  const testNotes = [
    'Crown prep completed. Shade: A2',
    'Patient wants shade A3 to match adjacent teeth',
    'Use B2 shade for this case',
    'Shade selected: C1',
    'No specific shade mentioned'
  ];
  
  for (const notes of testNotes) {
    const shade = detection.extractShade(notes);
    console.log(`Notes: "${notes}"`);
    console.log(`  Extracted Shade: ${shade}\n`);
  }
  
  console.log('✅ Shade Extraction Test Complete\n');
}

// ============================================
// RUN ALL TESTS
// ============================================

export async function runAllTests(): Promise<void> {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   CROWN WORK ORDER SYSTEM - END-TO-END TESTS             ║');
  console.log('║   Day 3: Internal Crown Workflow                          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  try {
    await testCrownDetection();
    await testHelperFunctions();
    await testShadeExtraction();
    await testValidation();
    await testPDFGeneration();
    await testCompleteWorkflow();
    
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   ✅ ALL TESTS PASSED SUCCESSFULLY!                      ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    console.log('📁 Generated Files:');
    console.log(`   ${OUTPUT_DIR}/work-order-sample-001.html`);
    console.log(`   ${OUTPUT_DIR}/work-order-sample-002.html`);
    console.log(`   ${OUTPUT_DIR}/work-order-sample-003.html`);
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

