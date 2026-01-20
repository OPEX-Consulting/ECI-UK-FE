import { Incident, AuditEntry, User } from '@/types/incident';

const STORAGE_KEYS = {
  INCIDENTS: 'regtech_incidents',
  AUDIT_LOG: 'regtech_audit_log',
  CURRENT_USER: 'regtech_current_user',
};

// Incident Storage
export const getIncidents = (): Incident[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveIncident = (incident: Incident): void => {
  const incidents = getIncidents();
  const existingIndex = incidents.findIndex(i => i.id === incident.id);
  
  if (existingIndex >= 0) {
    incidents[existingIndex] = { ...incident, updatedAt: new Date().toISOString() };
  } else {
    incidents.push(incident);
  }
  
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  
  // Dispatch custom event to notify components of data changes
  window.dispatchEvent(new CustomEvent('incidents-updated'));
};

export const getIncidentById = (id: string): Incident | undefined => {
  return getIncidents().find(i => i.id === id);
};

export const getIncidentsByReporter = (reporterId: string): Incident[] => {
  return getIncidents().filter(i => i.reporterId === reporterId);
};

export const getIncidentsByStatus = (statuses: string[]): Incident[] => {
  return getIncidents().filter(i => statuses.includes(i.status));
};

export const getFinalizedIncidents = (): Incident[] => {
  return getIncidents().filter(i => i.status === 'finalized');
};

// Audit Log Storage
export const getAuditLog = (): AuditEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
  return data ? JSON.parse(data) : [];
};

export const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>): void => {
  const log = getAuditLog();
  log.push({
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log));
};

export const getAuditEntriesForIncident = (incidentId: string): AuditEntry[] => {
  return getAuditLog()
    .filter(e => e.incidentId === incidentId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// User Session Storage
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
