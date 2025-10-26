/**
 * TypeScript interfaces for Open Dental FHIR resources
 * Based on FHIR R4 specification
 */

export interface FHIRIdentifier {
  system?: string;
  value: string;
}

export interface FHIRHumanName {
  use?: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRReference {
  reference?: string;
  display?: string;
}

export interface Patient {
  resourceType: 'Patient';
  id?: string;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: FHIRAddress[];
}

export interface Procedure {
  resourceType: 'Procedure';
  id?: string;
  identifier?: FHIRIdentifier[];
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject: FHIRReference;
  performedDateTime?: string;
  performer?: Array<{
    actor: FHIRReference;
  }>;
  note?: Array<{
    text: string;
  }>;
}

export interface Appointment {
  resourceType: 'Appointment';
  id?: string;
  identifier?: FHIRIdentifier[];
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  serviceType?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  appointmentType?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  description?: string;
  start?: string;
  end?: string;
  participant?: Array<{
    actor?: FHIRReference;
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  }>;
}

export interface LabCase {
  resourceType: 'ServiceRequest';
  id?: string;
  identifier?: FHIRIdentifier[];
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  subject: FHIRReference;
  authoredOn?: string;
  requester?: FHIRReference;
  performer?: FHIRReference[];
  note?: Array<{
    text: string;
  }>;
}

export interface Laboratory {
  resourceType: 'Organization';
  id?: string;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  type?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  name?: string;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
}

export interface Provider {
  resourceType: 'Practitioner';
  id?: string;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  qualification?: Array<{
    code: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
  }>;
}

export interface Document {
  resourceType: 'DocumentReference';
  id?: string;
  identifier?: FHIRIdentifier[];
  status: 'current' | 'superseded' | 'entered-in-error';
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  subject?: FHIRReference;
  date?: string;
  author?: FHIRReference[];
  content: Array<{
    attachment: {
      contentType?: string;
      data?: string;
      url?: string;
      title?: string;
    };
  }>;
}
