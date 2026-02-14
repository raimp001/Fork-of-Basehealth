# Multi-Agent Care Mesh Roadmap

This app now includes an initial **agent mesh** scaffold to support a future where patients and clinicians can access specialized AI agents.

## Agent roles included
- Billing agent (reimbursement and denial prevention)
- Coordinator agent (cross-agent handoff + timeline)
- PCP finder agent (best PCP match)
- PCP copilot agent (preventive/screening guidance)
- Prior-auth navigator agent
- Formulary cost optimizer agent
- Research agent (NCCN, UpToDate-style evidence summaries, literature)

## API
- `GET /api/care-orchestration/agents` → list all agent definitions.
- `POST /api/care-orchestration/agents` with `{ intake }` → returns a routed task plan.

## Notes
- This is an orchestration baseline, intentionally rules-based and auditable.
- Production deployment should plug each role into validated external tools, payer APIs, drug pricing feeds, and evidence services.


## New orchestration behavior
- `POST /api/care-orchestration/actions` now performs a coordinator pre-route (`buildAgentPlan`) before invoking OpenCloud tasks.
- Each action response includes a routed task plan, enabling explicit inter-agent handoff visibility for audits and debugging.
