"""
Lab Slip PDF Generator
Generates professional dental laboratory prescription PDFs
"""
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from datetime import datetime
from typing import Dict, Optional
import os

class LabSlipPDFGenerator:
    """Generate professional lab slip PDFs for dental procedures"""
    
    def __init__(self):
        self.practice_info = {
            'name': 'Huntington Beach Dental Center',
            'address': '17692 Beach Blvd STE 310',
            'city_state_zip': 'Huntington Beach, CA 92647',
            'phone': '714-842-5035'
        }
    
    def generate(self, lab_slip_data: Dict, output_path: str) -> str:
        """
        Generate a lab slip PDF
        
        Args:
            lab_slip_data: Dictionary containing lab slip information
            output_path: Path where PDF should be saved
            
        Returns:
            Path to generated PDF
        """
        # Create PDF
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 18)
        c.drawString(1*inch, height - 0.75*inch, "DENTAL LABORATORY PRESCRIPTION")
        
        # Draw horizontal line
        c.setLineWidth(2)
        c.line(1*inch, height - 0.9*inch, width - 1*inch, height - 0.9*inch)
        
        # Practice Information Section
        y_position = height - 1.3*inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1*inch, y_position, "FROM:")
        
        c.setFont("Helvetica", 10)
        y_position -= 0.2*inch
        c.drawString(1*inch, y_position, self.practice_info['name'])
        y_position -= 0.15*inch
        c.drawString(1*inch, y_position, self.practice_info['address'])
        y_position -= 0.15*inch
        c.drawString(1*inch, y_position, self.practice_info['city_state_zip'])
        y_position -= 0.15*inch
        c.drawString(1*inch, y_position, f"Phone: {self.practice_info['phone']}")
        
        # Lab Information Section
        y_position -= 0.4*inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1*inch, y_position, "TO:")
        
        c.setFont("Helvetica", 10)
        y_position -= 0.2*inch
        lab_name = lab_slip_data.get('lab_name', 'Laboratory')
        c.drawString(1*inch, y_position, f"Lab: {lab_name}")
        
        if lab_slip_data.get('lab_contact'):
            y_position -= 0.15*inch
            c.drawString(1*inch, y_position, f"Contact: {lab_slip_data['lab_contact']}")
        
        if lab_slip_data.get('lab_email'):
            y_position -= 0.15*inch
            c.drawString(1*inch, y_position, f"Email: {lab_slip_data['lab_email']}")
        
        # Draw section divider
        y_position -= 0.3*inch
        c.setLineWidth(1)
        c.line(1*inch, y_position, width - 1*inch, y_position)
        
        # Patient Information Section
        y_position -= 0.3*inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1*inch, y_position, "PATIENT INFORMATION")
        
        c.setFont("Helvetica", 10)
        y_position -= 0.25*inch
        patient_name = lab_slip_data.get('patient_name', 'Unknown Patient')
        c.drawString(1*inch, y_position, f"Name: {patient_name}")
        
        if lab_slip_data.get('patient_dob'):
            y_position -= 0.15*inch
            dob = lab_slip_data['patient_dob']
            if isinstance(dob, str):
                c.drawString(1*inch, y_position, f"Date of Birth: {dob}")
            else:
                c.drawString(1*inch, y_position, f"Date of Birth: {dob.strftime('%m/%d/%Y')}")
        
        # Procedure Information Section
        y_position -= 0.4*inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1*inch, y_position, "PROCEDURE INFORMATION")
        
        c.setFont("Helvetica", 10)
        y_position -= 0.25*inch
        procedure_code = lab_slip_data.get('procedure_code', 'N/A')
        procedure_desc = lab_slip_data.get('procedure_description', '')
        if procedure_desc:
            c.drawString(1*inch, y_position, f"Procedure: {procedure_code} - {procedure_desc}")
        else:
            c.drawString(1*inch, y_position, f"Procedure Code: {procedure_code}")
        
        if lab_slip_data.get('tooth_number'):
            y_position -= 0.15*inch
            c.drawString(1*inch, y_position, f"Tooth Number: {lab_slip_data['tooth_number']}")
        
        if lab_slip_data.get('shade'):
            y_position -= 0.15*inch
            c.drawString(1*inch, y_position, f"Shade: {lab_slip_data['shade']}")
        
        if lab_slip_data.get('due_date'):
            y_position -= 0.15*inch
            due_date = lab_slip_data['due_date']
            if isinstance(due_date, str):
                c.drawString(1*inch, y_position, f"Due Date: {due_date}")
            else:
                c.drawString(1*inch, y_position, f"Due Date: {due_date.strftime('%m/%d/%Y')}")
        
        # Special Instructions Section
        if lab_slip_data.get('special_instructions'):
            y_position -= 0.4*inch
            c.setFont("Helvetica-Bold", 12)
            c.drawString(1*inch, y_position, "SPECIAL INSTRUCTIONS")
            
            c.setFont("Helvetica", 10)
            y_position -= 0.25*inch
            
            # Handle multi-line instructions
            instructions = lab_slip_data['special_instructions']
            max_width = width - 2*inch
            
            # Simple word wrapping
            words = instructions.split()
            line = ""
            for word in words:
                test_line = line + word + " "
                if c.stringWidth(test_line, "Helvetica", 10) < max_width:
                    line = test_line
                else:
                    c.drawString(1*inch, y_position, line.strip())
                    y_position -= 0.15*inch
                    line = word + " "
            
            if line:
                c.drawString(1*inch, y_position, line.strip())
        
        # Footer with generation timestamp
        c.setFont("Helvetica", 8)
        footer_text = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        c.drawString(1*inch, 0.5*inch, footer_text)
        
        # Add lab slip ID if available
        if lab_slip_data.get('id'):
            c.drawString(width - 3*inch, 0.5*inch, f"Lab Slip ID: {lab_slip_data['id'][:8]}")
        
        # Save PDF
        c.save()
        
        return output_path
    
    def generate_from_database_record(self, record: Dict, output_dir: str = "/tmp") -> str:
        """
        Generate PDF from a database record
        
        Args:
            record: Database record from lab_slips table
            output_dir: Directory to save PDF
            
        Returns:
            Path to generated PDF
        """
        # Create filename
        patient_name = record.get('patient_name', 'unknown').replace(' ', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"lab_slip_{patient_name}_{timestamp}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        # Extract lab information from lab_slip_data if available
        lab_data = record.get('lab_slip_data', {})
        
        # Prepare data for PDF generation
        pdf_data = {
            'id': record.get('id'),
            'patient_name': record.get('patient_name'),
            'patient_dob': record.get('patient_dob'),
            'procedure_code': record.get('procedure_code'),
            'procedure_description': record.get('procedure_description'),
            'tooth_number': record.get('tooth_number'),
            'shade': record.get('shade'),
            'special_instructions': record.get('special_instructions'),
            'due_date': record.get('due_date'),
            'lab_name': lab_data.get('lab_name', 'Default Lab'),
            'lab_contact': lab_data.get('lab_contact'),
            'lab_email': lab_data.get('lab_email')
        }
        
        return self.generate(pdf_data, output_path)


def main():
    """Test the PDF generator"""
    generator = LabSlipPDFGenerator()
    
    # Test data
    test_data = {
        'id': 'f573329e-6804-4cc2-884e-256f715a323d',
        'patient_name': 'John Smith',
        'patient_dob': '01/15/1980',
        'procedure_code': 'D2740',
        'procedure_description': 'Crown - porcelain/ceramic substrate',
        'tooth_number': '#14',
        'shade': 'A2',
        'special_instructions': 'Standard crown preparation. Patient prefers natural appearance. Please ensure proper occlusion.',
        'due_date': '11/15/2025',
        'lab_name': 'Default Lab',
        'lab_contact': 'Lab Manager',
        'lab_email': 'lab@example.com'
    }
    
    output_path = generator.generate(test_data, '/tmp/lab_slip_production_test.pdf')
    print(f"✓ PDF generated: {output_path}")
    
    # Check file exists
    if os.path.exists(output_path):
        size = os.path.getsize(output_path)
        print(f"✓ File size: {size} bytes")
    else:
        print("✗ File not found")


if __name__ == "__main__":
    main()
