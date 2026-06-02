# API Endpoints — Frontend Integration

Base URL: `VITE_API_URL` (default `http://127.0.0.1:8000/api/v1`)

---

## Admin Panel (`/admin/`)

### Auth

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/admin/auth/login` | `adminLogin` | Admin login with email/password |
| GET | `/admin/auth/me` | `getCurrentUser` | Get current admin user session |
| GET | `/admin/auth/list` | `getAdminUsers` | List all admin users |
| POST | `/admin/auth/suspend` | `suspendAdminUser` | Suspend an admin user by ID |
| POST | `/admin/auth/unsuspend` | `unsuspendAdminUser` | Unsuspend/restore an admin user |

### Dashboard

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/admin/dashboard/` | `getAdminDashboardData` | Admin dashboard KPIs and stats |

### Organisations

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/admin/organisations/` | `getOrganisations` | List all organisations (paginated) |
| GET | `/admin/organisations/{id}` | `getOrganisationDetail` | Get single org detail with users, frameworks, school info |
| POST | `/admin/organisations/{id}/rerun-classification` | `rerunClassification` | Trigger re-classification for an org |

### School Types

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/admin/school-types` | `getSchoolTypes` | List all school types (admin view) |
| POST | `/admin/school-types` | `createSchoolType` | Create a new school type |
| PATCH | `/admin/school-types/{id}` | `updateSchoolType` | Update school type fields or status |
| DELETE | `/admin/school-types/{id}` | `deleteSchoolType` | Delete a school type |

### Frameworks (Admin)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/admin/frameworks/upload` | `uploadFrameworkDocument` | Upload a framework document file |
| POST | `/admin/frameworks/` | `createFrameworkFromUrl` | Create framework draft from a URL |
| POST | `/admin/frameworks/` | `createFrameworkFromText` | Create framework draft from raw text |
| GET | `/admin/frameworks/drafts` | `getFrameworkDrafts` | List all framework drafts |
| GET | `/admin/frameworks/{id}` | `getFrameworkDraft` | Get single framework draft detail |
| POST | `/admin/frameworks/{id}/synthesize` | `synthesizeTasks` | Start AI task synthesis for a draft |
| PATCH | `/admin/frameworks/{id}` | `updateFrameworkStructure` | Update framework structure (themes, tasks, sub-tasks) |
| POST | `/admin/frameworks/{id}/submit` | `refineFrameworkObligations` | Submit obligations for refinement |
| POST | `/admin/frameworks/{id}/publish` | `publishFramework` | Publish a framework to make it live |

### Audit Logs

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/admin/audit-logs` | `getAuditLogs` | List audit log entries (paginated, filterable) |

### Notifications

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/admin/notifications/` | `getNotifications` | List all admin notifications |
| DELETE | `/admin/notifications/` | `clearAllNotifications` | Clear/dismiss all notifications |
| GET | `/admin/notifications/{id}` | `getNotificationDetail` | Get single notification detail |
| DELETE | `/admin/notifications/{id}` | `deleteNotification` | Delete a single notification |

---

## School / Organisation (`/school/`)

### Auth (School)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/auth/signup/email` | `signUp` | Register a new school user with email |
| POST | `/school/auth/verify-otp` | `verifyOtp` | Verify email OTP during signup |
| POST | `/school/auth/resend-otp` | `resendOtp` | Resend verification OTP |
| POST | `/school/auth/login` | `login` | School user login |
| POST | `/school/invitations/accept` | `acceptInvite` | Accept an invitation to join an organisation |
| GET | `/school/profile` | `getCurrentSchoolUser` | Get current school user profile |

### Organisation Setup

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/organisation/setup` | `setup` | Set up organisation details after signup |

### Invitations

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/invitations` | `getInvitations` | List invitations for the organisation |
| POST | `/school/invitations` | `inviteUser` | Invite new users to the organisation |

### Frameworks (School)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/organisation/frameworks` | `getFrameworks` | List all frameworks assigned to the school |
| GET | `/school/organisation/frameworks/{id}` | `getFrameworkDetail` | Get single assigned framework with full detail |
| GET | `/school/organisation/frameworks/tasks` | `getAssignedFrameworksWithTasks` | List assigned frameworks with their tasks pre-loaded |

### Users

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/organisation/users` | `getUsers` | List all users in the school's organisation |

### Activation

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/activate` | (inline) | Activate the compliance environment after onboarding |

### Classification

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/classification/step` | `saveStep` | Save a single compliance classification step (1–5) |
| GET | `/school/classification/summary` | `getSummary` | Get classification summary with identified frameworks, regulators, and risk areas |

### Dashboard (School)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/dashboard` | `getPrincipalDashboard` | Principal dashboard data |
| GET | `/school/incidents/my-dashboard` | `getStaffDashboard` | Staff dashboard data with my reports |
| GET | `/school/incidents/severity-distribution` | `getSeverityDistribution` | Incident severity distribution chart data |

### Tasks

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/tasks` | `getAllTasks` | List all tasks (optional filters) |
| GET | `/school/tasks/frameworks/{frameworkId}` | `getFrameworkTasks` | List tasks for a specific framework |
| GET | `/school/tasks/{taskId}` | `getTaskDetails` | Get single task with sub-tasks and action items |
| PATCH | `/school/tasks/{taskId}` | `updateTask` | Update basic task fields |
| POST | `/school/tasks/{taskId}/status` | `updateTaskStatus` | Update task status |
| POST | `/school/tasks/{taskId}/assign` | `assignTask` | Assign task to a user |
| POST | `/school/tasks` | `createTask` | Create a new task |
| GET | `/school/tasks/{taskId}/analytics` | `getTaskAnalytics` | Get task analytics data |
| POST | `/school/tasks/{taskId}/action-items/{actionItemId}/evidence` | `addEvidence` | Upload evidence file to a task's action item |

### Sub-tasks

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/tasks/{taskId}/subtasks` | `addSubtask` | Add a sub-task to a task |
| PATCH | `/school/tasks/{taskId}/subtasks/{subtaskId}` | `updateSubtask` | Update sub-task details |
| POST | `/school/tasks/{taskId}/subtasks/{subtaskId}/complete` | `completeSubtask` | Mark sub-task as complete |
| DELETE | `/school/tasks/{taskId}/subtasks/{subtaskId}` | `deleteSubtask` | Delete a sub-task |

### Incidents

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school/incidents` | `listIncidents` | List all incidents |
| GET | `/school/incidents/my-reports` | `listMyReports` | List incidents reported by current user |
| POST | `/school/incidents` | `createIncident` | Create a new incident report |
| GET | `/school/incidents/{incidentId}` | `getIncidentDetail` | Get single incident with full detail |
| PATCH | `/school/incidents/{incidentId}` | `editIncident` | Edit incident title/description |
| POST | `/school/incidents/{incidentId}/status` | `updateStatus` | Update incident status |
| POST | `/school/incidents/{incidentId}/assign` | `assignOfficer` | Assign an officer to an incident |
| POST | `/school/incidents/{incidentId}/documents` | `uploadDocument` | Upload a document to an incident |
| POST | `/school/incidents/{incidentId}/discussion` | `addDiscussionMessage` | Add a discussion message to an incident |

---

## Shared / Unprefixed

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/school-types` | `getSchoolTypes` | List school types (public/school-facing) |
| GET | `/school-types/{id}` | `getSchoolType` | Get a single school type by ID |
| GET | `/startup-data` | `getStartupData` | Fetch startup data mappings for compliance wizard |

---

## Admin Sub-task Operations (inside framework service)

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| POST | `/school/tasks/{taskId}/subtasks` | `addSubTask` | Add a sub-task (admin framework builder) |
| PATCH | `/school/tasks/{taskId}/subtasks/{subtaskId}` | `updateSubTask` | Update sub-task (admin framework builder) |
| DELETE | `/school/tasks/{taskId}/subtasks/{subtaskId}` | `deleteSubTask` | Delete sub-task (admin framework builder) |

---

**Totals:** 76 endpoints · 36 GET · 30 POST · 6 PATCH · 4 DELETE
