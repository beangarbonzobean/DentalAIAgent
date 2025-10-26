"""
Lab Slip API Helper Functions
Provides Python interface to Supabase lab slip operations
"""
import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class LabSlipAPI:
    """API interface for lab slip operations"""
    
    def __init__(self, supabase_client=None):
        """
        Initialize API with Supabase client
        
        Args:
            supabase_client: Supabase client instance (optional for documentation)
        """
        self.supabase = supabase_client
    
    def create_lab_slip(self, procedure_data: Dict) -> Dict:
        """
        Create a new lab slip from procedure data
        
        Args:
            procedure_data: Dictionary containing procedure information
                - patient_name: str
                - patient_dob: str (optional)
                - procedure_code: str (D2740, D2750, etc.)
                - procedure_description: str (optional)
                - tooth_number: str (optional)
                - shade: str (optional)
                - special_instructions: str (optional)
                - lab_id: str (optional, defaults to default lab)
                
        Returns:
            Dictionary with created lab slip data
        """
        # Calculate due date (typically 2 weeks from now)
        due_date = (datetime.now() + timedelta(days=14)).date()
        
        lab_slip_data = {
            'patient_name': procedure_data['patient_name'],
            'patient_dob': procedure_data.get('patient_dob'),
            'procedure_code': procedure_data['procedure_code'],
            'procedure_description': procedure_data.get('procedure_description'),
            'tooth_number': procedure_data.get('tooth_number'),
            'shade': procedure_data.get('shade'),
            'special_instructions': procedure_data.get('special_instructions'),
            'due_date': due_date.isoformat(),
            'status': 'pending',
            'lab_id': procedure_data.get('lab_id'),  # Will use default if None
            'opendental_patient_id': procedure_data.get('opendental_patient_id'),
            'opendental_procedure_id': procedure_data.get('opendental_procedure_id'),
            'opendental_appointment_id': procedure_data.get('opendental_appointment_id'),
            'lab_slip_data': procedure_data.get('additional_data', {})
        }
        
        if self.supabase:
            result = self.supabase.table('lab_slips').insert(lab_slip_data).execute()
            return result.data[0] if result.data else None
        
        return lab_slip_data
    
    def get_lab_slip(self, lab_slip_id: str) -> Optional[Dict]:
        """
        Retrieve a lab slip by ID
        
        Args:
            lab_slip_id: UUID of the lab slip
            
        Returns:
            Lab slip data or None if not found
        """
        if self.supabase:
            result = self.supabase.table('lab_slips')\
                .select('*, labs(*)')\
                .eq('id', lab_slip_id)\
                .single()\
                .execute()
            return result.data if result.data else None
        
        return None
    
    def list_lab_slips(self, status: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """
        List lab slips with optional filtering
        
        Args:
            status: Filter by status (pending, sent, in_progress, completed, cancelled)
            limit: Maximum number of results
            
        Returns:
            List of lab slip records
        """
        if self.supabase:
            query = self.supabase.table('lab_slips').select('*, labs(*)')
            
            if status:
                query = query.eq('status', status)
            
            result = query.order('created_at', desc=True).limit(limit).execute()
            return result.data if result.data else []
        
        return []
    
    def update_lab_slip_status(self, lab_slip_id: str, status: str, notes: Optional[str] = None) -> Dict:
        """
        Update the status of a lab slip
        
        Args:
            lab_slip_id: UUID of the lab slip
            status: New status (pending, sent, in_progress, completed, cancelled)
            notes: Optional notes about the status change
            
        Returns:
            Updated lab slip data
        """
        update_data = {
            'status': status,
            'updated_at': datetime.now().isoformat()
        }
        
        # Set timestamp fields based on status
        if status == 'sent':
            update_data['sent_at'] = datetime.now().isoformat()
        elif status == 'completed':
            update_data['completed_at'] = datetime.now().isoformat()
        
        if notes:
            # Add notes to lab_slip_data
            if self.supabase:
                current = self.get_lab_slip(lab_slip_id)
                if current:
                    lab_data = current.get('lab_slip_data', {})
                    if 'status_history' not in lab_data:
                        lab_data['status_history'] = []
                    lab_data['status_history'].append({
                        'status': status,
                        'notes': notes,
                        'timestamp': datetime.now().isoformat()
                    })
                    update_data['lab_slip_data'] = lab_data
        
        if self.supabase:
            result = self.supabase.table('lab_slips')\
                .update(update_data)\
                .eq('id', lab_slip_id)\
                .execute()
            return result.data[0] if result.data else None
        
        return update_data
    
    def detect_crown_procedures(self, procedures: List[Dict]) -> List[Dict]:
        """
        Detect crown procedures that need lab slips
        
        Args:
            procedures: List of procedure dictionaries from Open Dental
                Each should have: procedure_code, patient_name, etc.
                
        Returns:
            List of procedures that need lab slips (crown codes)
        """
        crown_codes = ['D2740', 'D2750', 'D2751', 'D2752', 'D2780', 'D2781', 'D2782', 'D2783']
        
        crown_procedures = []
        for proc in procedures:
            proc_code = proc.get('procedure_code', '').upper()
            if proc_code in crown_codes:
                crown_procedures.append(proc)
        
        return crown_procedures
    
    def generate_pdf_for_lab_slip(self, lab_slip_id: str) -> Dict:
        """
        Trigger PDF generation for a lab slip
        
        This would call the Edge Function or PDF generation service
        
        Args:
            lab_slip_id: UUID of the lab slip
            
        Returns:
            Result with PDF URL
        """
        # In production, this would call the Edge Function
        # For now, return a simulated response
        return {
            'success': True,
            'lab_slip_id': lab_slip_id,
            'pdf_url': f'https://storage.example.com/lab-slips/{lab_slip_id}.pdf',
            'message': 'PDF generation triggered'
        }
    
    def get_pending_lab_slips(self) -> List[Dict]:
        """
        Get all pending lab slips that need attention
        
        Returns:
            List of pending lab slips
        """
        return self.list_lab_slips(status='pending')
    
    def get_overdue_lab_slips(self) -> List[Dict]:
        """
        Get lab slips that are overdue (past due date and not completed)
        
        Returns:
            List of overdue lab slips
        """
        if self.supabase:
            today = datetime.now().date().isoformat()
            result = self.supabase.table('lab_slips')\
                .select('*, labs(*)')\
                .lt('due_date', today)\
                .neq('status', 'completed')\
                .neq('status', 'cancelled')\
                .order('due_date', desc=False)\
                .execute()
            return result.data if result.data else []
        
        return []


def main():
    """Example usage"""
    api = LabSlipAPI()
    
    print("Lab Slip API Helper Functions")
    print("=" * 50)
    print()
    print("Available Methods:")
    print("- create_lab_slip(procedure_data)")
    print("- get_lab_slip(lab_slip_id)")
    print("- list_lab_slips(status=None, limit=50)")
    print("- update_lab_slip_status(lab_slip_id, status, notes=None)")
    print("- detect_crown_procedures(procedures)")
    print("- generate_pdf_for_lab_slip(lab_slip_id)")
    print("- get_pending_lab_slips()")
    print("- get_overdue_lab_slips()")
    print()
    print("Example: Creating a lab slip")
    print("-" * 50)
    
    example_procedure = {
        'patient_name': 'Jane Doe',
        'patient_dob': '03/15/1985',
        'procedure_code': 'D2750',
        'procedure_description': 'Crown - porcelain fused to high noble metal',
        'tooth_number': '#3',
        'shade': 'B1',
        'special_instructions': 'Patient has high bite force. Reinforce occlusal surface.',
        'opendental_procedure_id': 12345
    }
    
    lab_slip = api.create_lab_slip(example_procedure)
    print(json.dumps(lab_slip, indent=2, default=str))


if __name__ == "__main__":
    main()

