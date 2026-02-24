# Incident Response Procedures

## Overview

Bedrock incident response procedures ensure rapid detection, clear communication, and documented resolution of security, privacy, and availability incidents. This guide is designed for the Bedrock development team—some with advanced security roles—to make fast decisions during incidents.

### Key Principles

- **Rapid Detection**: Monitor and detect incidents as early as possible
- **Clear Communication**: Ensure all team members know incident status and next steps
- **Documented Procedures**: Follow defined runbooks to ensure consistent, effective response
- **Continuous Improvement**: Post-incident reviews inform future prevention and response

---

## Severity Levels

| Level | Name | Indicators | Response Time | Examples |
|-------|------|-----------|---|----------|
| **P1** | Critical | Service completely down; active security breach; encryption system compromised | <30 min | User data exposed; service offline; all users unable to access |
| **P2** | High | Service degraded; potential unauthorized access; key functionality impaired | <2 hours | Login issues for subset of users; slow file operations; suspected compromise attempt |
| **P3** | Medium | Minor service issues; unconfirmed security concern; non-critical feature broken | <8 hours | One feature returning errors; unclear security alert; small performance degradation |
| **P4** | Low | Non-urgent issues; potential improvements; documentation gaps | Next business day | Typo in error message; minor UI glitch; missing edge case handling |

---

## Determining Severity and Escalation

### Severity Determination Questions

Answer these questions to help determine the incident severity:

1. **Is the service unavailable to users or a significant feature?**
   - Yes → P1 or P2 (depending on scope)
   - No → Check next question

2. **Is there a confirmed or suspected security breach or data exposure?**
   - Yes → P1 immediately
   - No → Check next question

3. **Is the issue affecting all users or a critical workflow?**
   - Yes → P2
   - No → P3 or P4

4. **Do we need to notify users or customers?**
   - Yes → P1 or P2
   - No → P3 or P4

### Escalation and Notification

**P1 (Critical):**
- Notify all team members immediately (team Slack channel + direct message to leads)
- Incident Lead assigned (senior dev)
- Technical Lead coordinates fix
- Security Lead involved if breach-related
- Aim for communication every 15 minutes during active response

**P2 (High):**
- Notify team leads and on-call engineer
- Incident Lead assigned
- Update team every 30 minutes
- Security Lead consulted if security-adjacent

**P3 (Medium):**
- Notify relevant team members in Slack
- Incident Lead coordinates
- Update once per hour if active work

**P4 (Low):**
- Document in issue/ticket
- No immediate escalation required
- Address during normal sprint planning

### Incident Roles

**Incident Lead:** Coordinates communication, owns status updates, ensures follow-up
**Technical Lead:** Executes fixes, runs diagnostics, owns technical decisions
**Security Lead:** Validates security incidents, determines scope of compromise, advises on containment

---

## Quick Incident Reference

Use this table to quickly identify the right runbook for your incident:

| Incident Type | Category | Severity | Runbook |
|---|---|---|---|
| Service unavailable / 502 errors | Availability | P1 | [Service Downtime](#service-downtime) |
| Aleph sync/connection failures | Availability | P2-P3 | [Aleph Network Sync Failure](#aleph-network-sync-failure) |
| Frontend errors in production | Availability | P2-P3 | [Frontend Errors in Production](#frontend-errors-in-production) |
| Security breach detected | Security | P1 | [Security Breach Response](#security-breach-response) |
| Encryption key compromised | Security | P1 | [Encryption Key Compromise](#encryption-key-compromise) |

---

## Runbooks

### Service Downtime

**Severity:** P1 (Critical)

**Trigger:** Service returns 502 errors, is completely offline, or users cannot access the application.

**Immediate Actions:**
1. Confirm the outage is real (check from multiple locations/devices)
2. Post to team Slack: incident severity, current status, and who is investigating
3. Assign Incident Lead and Technical Lead

**Diagnostics:**
- Check deployment status: `git log --oneline -10` (was there a recent deploy?)
- Check application logs: Review Next.js server logs for errors in the last 5-10 minutes
- Check Aleph network status: Verify Aleph.im network is operational (check their status page)
- Check infrastructure: Is the application server running? (`docker ps` or equivalent hosting platform)

**Mitigation:**
- If recent deploy caused the issue: Rollback to previous stable version
- If Aleph network down: Post status update, no action needed on our side
- If application crashed: Restart service and check logs for root cause

**Validation:**
- Service responds with 200 OK from health check endpoint
- Users can log in and view files
- File upload/download operations work

**Post-Incident:**
- Log the incident details in a team document
- Schedule brief incident review within 24 hours to discuss root cause and prevention
- Create follow-up issues if needed (e.g., monitoring improvements, code fixes)

---
