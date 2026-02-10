ONBOARDING & ACCOUNT SETUP — PRODUCT FLOW DOCUMENT
1. Onboarding Design Principles
Your onboarding is not just account creation. It is a compliance classification engine disguised as onboarding.
Key principles:
✅ Low friction at the start


✅ Progressive disclosure (don’t overwhelm users)


✅ Institution-first, not individual-first


✅ Official identity bias (school-owned emails, Microsoft/Google)


✅ Data collected once, reused everywhere


✅ System remains usable but restricted until setup is complete


This aligns perfectly with regulated environments like education.

2. High-Level Onboarding Stages
The onboarding process has 5 major stages:
Authentication & Identity Creation


Email Verification / Trust Establishment


Organisation (School) Profile Setup


Compliance Classification Wizard


Activation & Dashboard Unlock


Each stage has clear entry and exit conditions.

3. Stage 1: Authentication & Account Creation
Entry Point
User clicks “Get Started” or “Sign Up”

3.1 Authentication Options
User is presented with three options:
Sign up with school email + password


Sign up with Google (Workspace)


Sign up with Microsoft (365 / Azure AD)


📌 Product intent
 Bias toward official institutional accounts, not personal emails.

3.2 Email + Password Flow
Inputs:
Email address


Password


Confirm password


Rules:
Email domain is captured (important later)


Password rules enforced (length, complexity)


Next step:
 → OTP verification (Stage 2)

3.3 Google / Microsoft SSO Flow
Flow:
User authenticates via provider


System retrieves:


Email


Name


Domain


Rules:
No OTP required


Email is considered verified by provider


Next step:
 → Organisation setup (Stage 3)

4. Stage 2: Email Verification (OTP)
Applies only to:
Email + password sign-ups


Flow:
System sends OTP to email


User enters OTP


OTP validated


Rules:
OTP expiry (e.g. 10 minutes)


Resend OTP allowed


Limited retry attempts


📌 Exit condition:
 Email is verified → proceed to onboarding

5. Forgot Password Flow (Parallel but Required)
Trigger:
User clicks “Forgot password”
Flow:
Enter registered email


OTP sent to email


OTP verified


User sets new password


Rules:
Same OTP logic as signup


Password history checks (optional)



6. Stage 3: Organisation (School) Profile Setup
UX Pattern
User is logged in, but:
Dashboard is visible but greyed out


Banner states:


 “Complete setup to activate your compliance dashboard”



This reassures the user they’re “inside” while guiding completion.

6.1 Organisation Creation (Mandatory)
This platform is organisation-centric, not user-centric.
Required Inputs:
School / Organisation name


Official school email domain (auto-suggested from signup)


Country (default: UK)


Region / Local Authority (optional but useful)


📌 Rules
First user becomes Organisation Admin


One organisation per domain (soft enforcement)



7. Stage 4: Compliance Classification Wizard (Critical)
This is the most important part of onboarding.
It should feel simple, but it’s doing serious work behind the scenes.

7.1 Wizard Structure
Presented as a multi-step guided flow (not a long form).
Step 1: School Type
Options:
State-funded (Maintained)


Academy / Free School


Independent (Private)


Special School


Alternative Provision


Other (with clarification)



Step 2: Funding & Governance
Options shown contextually:
Local Authority maintained


Academy Trust


Independent proprietor



Step 3: Age Ranges Served (Multi-select)
Early Years (0–5)


Primary (5–11)


Secondary (11–16)


Sixth Form (16–18)


📌 Triggers EYFS or post-16 obligations automatically.

Step 4: Special Provision
Checkboxes:
SEN provision


Residential / Boarding


Pupil Referral / AP


International students


Early years attached provision



Step 5: Operational Activities
Checkboxes:
School transport


Online / remote learning


CCTV in use


Work placements


Data-heavy systems (biometrics, MIS integrations)


📌 This step unlocks conditional compliance frameworks.

7.2 Behind-the-Scenes Logic
As the user answers:
System builds a compliance profile


Maps:


Applicable regulators


Applicable standards


Risk weighting


Required training sets


Default task frequencies


Nothing is shown yet — this happens silently.

8. Stage 5: Review & Activation
8.1 Compliance Summary Screen
User sees:
“Based on your answers, we’ve identified the following compliance areas”


List of:


Frameworks


Regulators (e.g. Ofsted, ISI)


High-risk focus areas


CTA:
 👉 “Activate Compliance Frameworks”

8.2 Activation Logic
On activation:
AI task engine generates:


Tasks


Frequencies


Risk levels


Training requirements are assigned


Policy templates become available


Dashboard unlocks


📌 This is the moment compliance becomes operational.

9. Post-Onboarding State
Dashboard Now Shows:
Compliance score (initially low / baseline)


Generated tasks


Upcoming deadlines


Required training


Policy gaps


Admin Prompt:
“Invite staff”


“Assign tasks”


“Upload existing policies”



10. Permissions & Invitations (Immediate Next Step)
Admin can:
Invite users via email


Assign roles


Users inherit organisation compliance context automatically



11. Data Model Summary (For Engineers)
Core Entities Created During Onboarding:
User


Organisation


OrganisationProfile


ComplianceProfile


FrameworkAssignments


RoleAssignment


Key Rule:
No compliance data exists without a completed organisation profile

12. Edge Cases & Safeguards
Personal email used → warning shown, not blocked


Multiple users from same domain → prompt to join existing org


Partial onboarding → persistent “Complete setup” banner


Changes later → re-run classification wizard (admin-only)



13. Why This Onboarding Is Strong
Feels simple to users


Builds a powerful compliance graph


Prevents misclassification


Reduces manual configuration


Scales to US or other countries later

