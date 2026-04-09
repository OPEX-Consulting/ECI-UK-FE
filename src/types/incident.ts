export type UserRole = 'staff' | 'officer' | 'principal' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type IncidentType = 'safeguarding' | 'behavioral' | 'health-safety';

export type IncidentStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under-review' 
  | 'info-requested' 
  | 'finalized';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  studentName: string;
  location: string;
  incidentDate: string;
  incidentTime: string;
  description: string;
  immediateAction: string;
  isUrgent: boolean;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  
  // Officer review fields
  officerReview?: {
    officerId: string;
    officerName: string;
    severity?: IncidentSeverity;
    classification?: string;
    assessment?: string;
    complianceCategory?: string;
    infoRequestMessage?: string;
    reviewedAt?: string;
  };
  
  // Additional info from staff (when requested)
  additionalInfo?: string;
  
  // Finalization
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface AuditEntry {
  id: string;
  incidentId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

export const HARDCODED_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'emmanuel.adedeji@eci.co.uk',
    name: 'Emmanuel Adedeji',
    role: 'admin',
  },
  {
    id: 'user-1',
    email: 'samuel.john@opexconsult.co.uk',
    name: 'Samuel John',
    role: 'principal',
  },
  {
    id: 'user-2',
    email: 'john96samuel@gmail.com',
    name: 'John Samuel',
    role: 'staff',
  },
  {
    id: 'user-3',
    email: 'sammyjay708@gmail.com',
    name: 'Sammy Jay',
    role: 'officer',
  },
];

export const LOCATIONS = [
  'Main Building - Ground Floor',
  'Main Building - First Floor',
  'Main Building - Second Floor',
  'Science Block',
  'Sports Hall',
  'Playground',
  'Cafeteria',
  'Library',
  'Art Studio',
  'Music Room',
  'Staff Room',
  'Reception',
  'Car Park',
  'Other',
];

export const COMPLIANCE_CATEGORIES = [
  'KCSIE Part 1 - Safeguarding Information',
  'KCSIE Part 2 - Management of Safeguarding',
  'KCSIE Part 3 - Safer Recruitment',
  'KCSIE Part 4 - Allegations',
  'KCSIE Part 5 - Child on Child Abuse',
  'EIF - Behaviour and Attitudes',
  'EIF - Personal Development',
  'EIF - Leadership and Management',
  'Health and Safety Regulations',
  'Other Statutory Requirement',
];
