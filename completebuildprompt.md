\# Sugam Sadak

\## Digital Road Infrastructure Lifecycle Platform

\### Product Requirements Document



| | |

|---|---|

| \*\*Team\*\* | AVSync |

| \*\*Event\*\* | Smart India Hackathon (SIH) |

| \*\*Domain\*\* | Road Infrastructure · Public Asset Management · Digital Governance |

| \*\*Document Status\*\* | Working Draft — Part 3 of 4 |

| \*\*Version\*\* | 0.3 |

| \*\*Classification\*\* | Internal — Team Working Document |



\---



\### About This Document



This PRD is being built as a living document across multiple working sessions rather than delivered as a single pass, because the scope the team has defined (32 sections, an estimated 50–70 pages) cannot be produced at real depth in one sitting without quality collapsing toward filler.



\*\*Delivered in Part 1 (Sections 1–11):\*\* Cover Page, Revision History, Executive Summary, Vision, Mission, Product Philosophy, Problem Analysis, Existing Government Workflow, Gap Analysis, Existing Solutions Analysis, Product Positioning.



\*\*Delivered in Part 2 (Sections 12–17):\*\* Stakeholder Analysis, User Personas, User Journey Maps, Functional Requirements, Non-Functional Requirements, Digital Road Passport Specification.



\*\*Pilot jurisdiction confirmed:\*\* Urban Local Body / Municipal Corporation road network (see Section 11).



\*\*This installment (Part 3) covers:\*\*

18\. Complete Module Specifications

19\. Notification Strategy

20\. Analytics Strategy

21\. Security Strategy

22\. Database Planning

23\. API Planning

24\. High-Level Architecture



\*\*Planned for Part 4 (final):\*\* Future Scalability, Success Metrics, Risks, Future Scope, Demo Strategy, SIH Winning Strategy, Judge Questions, Appendix.



A note on method: every substantive section below follows the same internal structure — \*\*Purpose, Business Value, Government Value, Technical Notes, MVP Scope, Future Scope, Possible Risks\*\* — except where a section is purely structural (cover page, revision history) and the framework would be padding rather than content.



\---



\## 1. Cover Page



\*\*Sugam Sadak\*\*

\*Every Road Has a History. Now It Has a Record.\*



A Digital Road Infrastructure Lifecycle Platform, submitted to the Smart India Hackathon by Team AVSync.



Domain: Road Infrastructure, Public Asset Management, Digital Governance

Document Type: Product Requirements Document

Prepared by: Team AVSync



\---



\## 2. Revision History



| Version | Date | Author | Summary of Changes |

|---|---|---|---|

| 0.1 | 22 Aug 2026 | Team AVSync | Initial draft. Sections 1–11: product framing, problem analysis, competitive landscape against existing government systems, and refined positioning. Incorporates a scope-narrowing pass on the original concept brief (see Section 6 and Section 11). |

| 0.2 | 22 Aug 2026 | Team AVSync | Added Sections 12–17: stakeholder analysis, personas, journey maps, functional and non-functional requirements, and the Digital Road Passport specification. Pilot jurisdiction confirmed as Urban Local Body / Municipal Corporation. |

| 0.3 | 22 Aug 2026 | Team AVSync | Added Sections 18–24: complete module specifications, notification strategy, analytics strategy, security strategy, database planning, API planning, and high-level architecture. |



\---



\## 3. Executive Summary



\*\*Purpose.\*\* India's roads are managed as a series of disconnected transactions — a complaint here, a work order there, an inspection filed in a register that never talks to the complaint system. No single record answers the basic question a citizen, an engineer, or an auditor should be able to ask in one search: \*what has actually happened to this specific stretch of road, ever?\*



Sugam Sadak answers that question by giving every road a permanent digital identity — the \*\*Digital Road Passport\*\* — and treating every hazard report, inspection, repair, contractor assignment, and rupee spent as an event in that road's lifecycle rather than a standalone ticket. The platform's differentiation is not the citizen reporting form; multiple government systems already do citizen-facing road complaints. The differentiation is what happens \*after\* the report: automatic linkage to the road's maintenance and warranty history, contractor accountability enforced through Defect Liability Period tracking, an explainable health score per road, and a closed loop back to the citizen who reported the issue.



The government road-technology landscape already includes GeoSadak (GIS-based road proposal and sanctioning for PMGSY), OMMAS (PMGSY works monitoring), Meri Sadak (PMGSY citizen complaints), GRRIS (citizen-facing rural GIS viewer), and iRAD (MoRTH's national accident database). Section 10 profiles each. None of them provide a cross-jurisdiction, lifecycle-linked, contractor-accountable asset record — which is the specific gap Sugam Sadak is built to fill, starting from a single pilot jurisdiction rather than claiming national coverage on day one.



\*\*The MVP built for SIH demonstration is deliberately narrower than the long-term vision.\*\* That distinction is treated as a first-class design decision throughout this document, not an afterthought — see Section 6 and Section 11.



\*\*Business Value.\*\* A working reference implementation that a state IT department, a smart-city SPV, or a GovTech vendor could reasonably fund a pilot for within one budget cycle.



\*\*Government Value.\*\* Demonstrable reduction in repeat-repair spend through contractor liability enforcement; a transparent, publicly inspectable health score per road; and an audit trail that satisfies RTI-style scrutiny by design rather than by retrofit.



\---



\## 4. Vision



A future in which every public road in India carries a permanent, queryable digital identity — so that safety, spending, and accountability decisions are made from continuous lifecycle data rather than from isolated complaints, and any citizen, engineer, or auditor can trace a road's full history in seconds.



\---



\## 5. Mission



To build and prove, starting with a single pilot jurisdiction, a lifecycle-tracking and accountability layer for road infrastructure that any Indian government body — municipal, state, or national — can adopt without replacing the systems it already runs, and that measurably shortens the distance between a citizen reporting a hazard and that hazard being fixed and recorded against the responsible party.



\---



\## 6. Product Philosophy



\*\*Purpose.\*\* To establish, before any feature is designed, what kind of product this is and is not — because the original framing ("this is not a complaint app, not a pothole app, not another portal — this is a digital operating system") is directionally right but needs a guardrail, or it becomes an unbounded scope that no hackathon team can ship.



The Road Asset is the primary entity. A Hazard Report is one event type among many in that asset's lifecycle — alongside inspections, repairs, contractor assignments, and budget entries. This ordering is correct and should not be diluted: if the citizen-reporting UI becomes the headline feature, the product collapses into "one more pothole app," which is the single most oversaturated category in this hackathon's history (see Section 10 and Section 11).



\*\*Business Value.\*\* A lifecycle-first data model is what makes the product resellable to a second, third, and tenth government body without a rewrite — because the underlying entity (a road, with a timeline) doesn't change even when the reporting channel, the department, or the state does.



\*\*Government Value.\*\* A lifecycle record turns "who is responsible for this pothole reappearing" from a political argument into a data lookup.



\*\*Technical Notes.\*\* The data model must be built asset-first: `road\\\_asset` as the root entity, with `hazard\\\_report`, `inspection`, `maintenance\\\_activity`, `contractor\\\_assignment`, and `budget\\\_entry` all foreign-keyed to it — never the reverse. This ordering decision, made now, is what every later schema and API decision in this document inherits.



\*\*MVP Scope.\*\* One pilot jurisdiction, one asset type (roads only — not bridges, culverts, or footpaths, even though the platform's philosophy would eventually extend to them), and a complete lifecycle loop (report → inspection → work order → closure → history update) for that one asset type.



\*\*Future Scope.\*\* Extension to bridges and other linear infrastructure assets under the same passport model; multi-jurisdiction federation once the single-jurisdiction model is proven.



\*\*Possible Risks.\*\* The philosophy's own strength is its main execution risk. "Every road, every event, forever" is an appealing sentence and an infinite-dataset problem if it is not deliberately bounded at each stage of delivery. Every section from here forward states its MVP boundary explicitly for exactly this reason.



\---



\## 7. Problem Analysis



\*\*Purpose.\*\* To establish, with evidence rather than assertion, what is actually broken in how road hazards and road assets are managed today — separated clearly from what is merely \*inconvenient\*.



\*\*The core problem is not the absence of complaint channels.\*\* Citizens can already report road issues through Meri Sadak (for PMGSY roads), through municipal grievance portals, through IVRS helplines, or informally through local representatives. The problem is that none of these channels connect to a persistent record of the \*asset\* being complained about. A pothole reported in year one and reappearing in year three at the same coordinates is treated as an entirely new, unrelated event — there is no system-enforced memory that ties it to the contractor who built the original patch, the warranty period that patch was under, or the inspection history of that stretch of road.



\*\*Pain points by stakeholder (expanded fully into personas in Part 2, Section 13):\*\*



\- \*\*Citizen:\*\* No visibility into what happens after a report is filed; no way to know if a report was acted on or silently dropped; no confirmation the same issue hasn't already been reported by ten other people at the same spot.

\- \*\*Junior Engineer:\*\* Receives hazard reports and work orders through disconnected channels (phone calls, physical files, generic grievance software) with no linkage to the road's prior repair or inspection history, so every assessment starts from zero.

\- \*\*Executive Engineer / Department Admin:\*\* No consolidated view of which roads are consuming disproportionate maintenance budget over time — a road that has been "fixed" five times in two years looks, in most current systems, identical to a road fixed once.

\- \*\*Contractor:\*\* No standing incentive structure tied to long-term road performance; payment is typically tied to work completion, not to work durability.

\- \*\*Auditor / Government Authority:\*\* Reconstructing "what did we spend on this road, and did the repair hold" currently requires manually cross-referencing paper or siloed records across multiple departments and years.



\*\*Business Value.\*\* Every one of these pain points is a distinct, demoable "before/after" moment — which matters directly for the demo strategy built later in this document (Part 3, Section 29).



\*\*Government Value.\*\* Repeat-repair spend is a quantifiable, budget-relevant number once lifecycle data exists; today it is invisible because the data linking one repair to the next does not exist.



\*\*Technical Notes.\*\* The problem is fundamentally a data-linkage problem, not a data-collection problem — most of the raw data (complaints, work orders, GIS layers) already exists somewhere in government systems (Section 10). The platform's job is to link it around the asset, not to re-collect it from scratch.



\*\*MVP Scope.\*\* Demonstrate the linkage problem and its resolution for one full lifecycle: a hazard reported against a road that has prior recorded history, showing the passport surfacing that history automatically during triage.



\*\*Future Scope.\*\* Predictive maintenance flagging based on accumulated lifecycle patterns across many roads.



\*\*Possible Risks.\*\* Overclaiming novelty here is a real risk — a judge from MoRTH, NRIDA, or a state PWD will know that citizen complaint channels already exist. The pitch must be precise: the gap is in linkage and accountability, not in complaint intake.



\---



\## 8. Existing Government Workflow



\*\*Purpose.\*\* To document, as-is, how a road hazard currently moves from occurrence to resolution — as the baseline the redesigned workflow (Part 2, Section 15) will be measured against.



\*\*As-is workflow (typical, cross-jurisdiction pattern):\*\*



1\. A hazard occurs on a road (pothole, cracking, waterlogging, damaged shoulder).

2\. A citizen may report it — channel varies by jurisdiction: Meri Sadak (PMGSY roads only), a municipal app or portal (urban roads), a phone call to a ward office, or no report at all if the citizen assumes nothing will happen.

3\. The report reaches a department official — routing logic differs by department and is often manual (a clerk reading a complaint and deciding which JE's beat it falls under).

4\. A Junior Engineer is assigned, typically without system access to that road's prior maintenance or inspection history.

5\. The JE inspects and either actions it directly or raises a work order/proposal.

6\. A contractor is engaged — through existing procurement processes (commonly via GEM for eligible works) — and executes the repair.

7\. Completion is marked, generally as a status change on the original complaint ticket, not as an update to a persistent asset record.

8\. The citizen may or may not be notified; there is typically no reopening path once a ticket is closed, and no visibility into whether the same spot is reported again under a new, unlinked ticket number.



\*\*Business Value.\*\* Naming this workflow precisely, with its actual failure points, is what lets the redesigned workflow in Part 2 claim specific, defensible improvements rather than generic ones.



\*\*Government Value.\*\* Department officials evaluating this product will recognize this workflow immediately — which builds credibility that generic "we will digitize everything" pitches don't earn.



\*\*Technical Notes.\*\* Step 7 is the critical failure point the entire product is designed around: completion is recorded against a \*ticket\*, not against an \*asset\*. Fixing exactly this one linkage is the smallest possible change that produces the platform's largest claimed benefit.



\*\*MVP Scope.\*\* Rebuild steps 2 through 7 for the pilot jurisdiction only, with every step writing to the road's passport rather than to an isolated ticket.



\*\*Future Scope.\*\* Workflow variants for the differing approval hierarchies of State PWD, NHAI, and Urban Local Bodies.



\*\*Possible Risks.\*\* Real department workflows have local variations (approval thresholds, sign-off chains) not captured in this generic version; Part 2's Functional Requirements should be validated against the specific pilot department's actual SOP rather than this generalized model alone.



\---



\## 9. Gap Analysis



\*\*Purpose.\*\* To state precisely what existing government systems already do well, so the product is positioned as filling a real gap rather than duplicating solved problems.



| Capability | GeoSadak | OMMAS | Meri Sadak | GRRIS | iRAD | Sugam Sadak (Target) |

|---|---|---|---|---|---|---|

| GIS-based asset/proposal mapping | Yes (PMGSY) | No | No | Yes (viewer) | No | Yes (ingests, doesn't recreate) |

| Works progress monitoring | No | Yes (PMGSY) | No | No | No | Yes, linked to asset |

| Citizen complaint intake | No | No | Yes (PMGSY) | Limited | No | Yes, all jurisdictions |

| Persistent per-asset lifecycle history | No | No | No | No | No | \*\*Yes — core differentiator\*\* |

| Contractor liability / warranty enforcement | No | No | No | No | No | \*\*Yes — core differentiator\*\* |

| Cross-jurisdiction coverage (urban + state + national) | Partial (rural-focused) | No (PMGSY only) | No (PMGSY-focused) | No (rural) | Yes (accidents only) | Yes (roadmap, not MVP) |

| Explainable per-asset health/risk score | No | No | No | No | No | \*\*Yes — core differentiator\*\* |

| Accident data linkage | No | No | No | No | Yes | Planned integration, not rebuild |

| Public open data access | Partial | No | No | Yes | Limited | Yes |



\*\*Business Value.\*\* This table is the single most important artifact for judge Q\&A (see Part 3, Section 31) — it converts "how is this different from what already exists" from a defensive question into a rehearsed, evidence-backed answer.



\*\*Government Value.\*\* It demonstrates the team understands the existing GovTech landscape well enough to interoperate with it rather than compete with it — a materially stronger signal to government evaluators than a from-scratch pitch.



\*\*Technical Notes.\*\* Where feasible, the platform should treat these systems as data sources to ingest (particularly GeoSadak's open GIS layers) rather than problems to re-solve.



\*\*MVP Scope.\*\* Demonstrate the three bolded differentiator rows live; the remaining rows can be described as roadmap/integration targets without a working demo.



\*\*Future Scope.\*\* Formal API-level interoperability with GeoSadak, OMMAS, and iRAD.



\*\*Possible Risks.\*\* Claiming interoperability the team hasn't actually tested is worse than not claiming it — Section 11 and the Demo Strategy (Part 3) should distinguish clearly between "integration we built" and "integration we've designed for."



\---



\## 10. Existing Solutions Analysis



\*\*Purpose.\*\* To profile each relevant existing system individually, in enough depth to survive direct questioning from a judge who has worked with any of them.



\*\*Meri Sadak (Ministry of Rural Development / NRIDA).\*\* A citizen-facing mobile app for PMGSY and non-PMGSY rural roads. Citizens can register a complaint about pace or quality of work, attach a photo, and track redressal, with a defined path to <cite index="3-1">reopen a complaint within 10 days if dissatisfied with the response</cite>. Its stated purpose is explicitly accountability-oriented — <cite index="6-1">compelling contractors and officials toward higher standards by making issues harder to dismiss once photographed and logged</cite>. \*\*Limitation relative to Sugam Sadak:\*\* complaint-centric, not asset-centric — a resolved complaint does not become part of a persistent, queryable history of the road itself, and scope is limited to PMGSY/rural roads.



\*\*GeoSadak (NRIDA, built by C-DAC).\*\* A web-GIS transaction system used for PMGSY road and bridge proposal creation, sanctioning, and visualization, with over 13,000 proposals processed and 1,000+ active officials at block-to-national level. \*\*Limitation:\*\* it is a planning and sanctioning tool, not a post-construction lifecycle tracker — it does not carry a road's condition history, hazard events, or contractor liability forward after a proposal is approved and built.



\*\*OMMAS.\*\* PMGSY's online works monitoring system, tracking project progress against sanctioned works. \*\*Limitation:\*\* progress-monitoring focused on the construction phase, not on the asset's condition over its operational life afterward.



\*\*GRRIS.\*\* A citizen-facing website exposing PMGSY GIS layers (roads, habitations, and related infrastructure) for public viewing. \*\*Limitation:\*\* a viewer, not a workflow system — no complaint intake, no lifecycle tracking, no accountability enforcement.



\*\*iRAD (MoRTH, World Bank-funded).\*\* A national accident database consolidating accident data from police, transport, road-owning agencies, and health departments to drive road-safety analytics and dashboards. \*\*Limitation:\*\* accident-event focused, not condition/maintenance focused — it answers "where do accidents happen" but not "why has this road's condition been deteriorating" or "who is contractually responsible for its current state."



\*\*Cross-cutting observation.\*\* All five systems are strong within their specific lane — planning (GeoSadak), progress (OMMAS), complaints (Meri Sadak), public viewing (GRRIS), and safety analytics (iRAD) — and all five are scoped to PMGSY rural roads or, for iRAD, to accidents nationally. None link condition, complaint, repair, contractor, and budget history around a single persistent asset record, and none currently reach urban municipal or State PWD road networks with the same rigor. That is the specific, named gap Sugam Sadak is positioned to fill.



\*Sources consulted: NRIDA/pmgsy.nic.in and rural.nic.in (Meri Sadak); C-DAC and PIB (GeoSadak); NRIDA (OMMAS, GRRIS); MoRTH district portals and RKCL road safety cell (iRAD).\*



\*\*Business Value.\*\* A precise, source-grounded competitive section is rare among student PRDs and reads as materially more credible to any evaluator with domain exposure.



\*\*Government Value.\*\* Signals the product is designed to interoperate with the existing GovTech stack, not replace it wholesale — which is the difference between a pilot-able proposal and a non-starter.



\*\*MVP Scope.\*\* No live integration required for SIH demo; the competitive positioning itself is the deliverable for this section.



\*\*Future Scope.\*\* Data-sharing agreements or API integration with NRIDA/MoRTH systems, pursued only after a successful pilot, not before.



\*\*Possible Risks.\*\* This landscape may have evolved since these sources were reviewed; before any government-facing pitch, re-verify current system capabilities directly with NRIDA/MoRTH or state nodal officers rather than relying solely on this document.



\---



\## 11. Product Positioning



\*\*Purpose.\*\* To state, in one place, exactly what Sugam Sadak is claiming to be — narrow enough to build and demo credibly, ambitious enough to justify the "digital operating system" framing as a roadmap.



\*\*Positioning statement.\*\* For government road-owning agencies — starting with a single pilot Urban Local Body or State PWD division — who need to break the link between citizen complaints and vanishing accountability, Sugam Sadak is a road asset lifecycle platform that, unlike Meri Sadak, GeoSadak, or generic municipal grievance systems, ties every hazard, repair, and contractor assignment to a persistent digital passport per road — enforcing contractor liability automatically and making a road's full history queryable in one search.



\*\*Recommended pilot jurisdiction: Urban Local Body / Municipal Corporation road network, single pilot city.\*\* Rationale: urban municipal roads are high-visibility, high-complaint-volume, and — unlike PMGSY rural roads — are not already served by a mature GIS/lifecycle system such as GeoSadak. This maximizes both demoability (judges and citizens recognize urban potholes immediately) and genuine white space (Section 9's gap table shows the least existing coverage here). \*\*Confirmed for this build.\*\* Team AVSync has accepted this recommendation — Section 12 onward is written specifically against the Urban Local Body / Municipal Corporation jurisdiction.



\*\*Differentiation pillars, in priority order:\*\*

1\. Persistent per-asset lifecycle history (the passport itself)

2\. Contractor accountability via Defect Liability Period enforcement

3\. Explainable, per-asset health score

4\. Cross-jurisdiction extensibility — positioned explicitly as roadmap, never claimed as MVP-complete



\*\*Business Value.\*\* A one-paragraph positioning statement this specific is what a founder would put on a pitch deck slide — and what a judge can repeat back accurately after a 5-minute demo, which is the actual test of whether positioning has worked.



\*\*Government Value.\*\* A single, named pilot jurisdiction gives a real department a concrete, low-risk adoption path — "run this in one municipal ward for two months" — rather than an abstract national platform pitch no single official has budget authority to approve.



\*\*Technical Notes.\*\* All subsequent sections (personas, journeys, functional requirements) should be written against the pilot jurisdiction chosen, with jurisdiction-specific fields (approval hierarchy, contractor engagement process, budget source) treated as configuration, not hardcoded assumptions — so a later State PWD or PMGSY pilot doesn't require a rebuild.



\*\*MVP Scope.\*\* One city, one department, the four differentiation pillars above, demonstrated end-to-end for a small number of real or realistic roads.



\*\*Future Scope.\*\* Expansion to additional wards, then additional cities, then additional jurisdiction types (State PWD, NHAI), each gated on a successful prior pilot.



\*\*Possible Risks.\*\* The biggest risk to this positioning is scope drift back toward the original 13-module, all-jurisdiction framing under pitch-day pressure to "sound bigger." The Demo Strategy section (Part 3) will need an explicit, rehearsed answer to "why isn't this bigger yet" that reframes narrow scope as disciplined execution, not limited ambition.



\---



\## 12. Stakeholder Analysis



\*\*Purpose.\*\* To map every actor who touches the system in the confirmed pilot jurisdiction — a Urban Local Body's road network — with their goals and current friction, so no requirement in Section 15 is invented without a stakeholder who actually needs it.



| Stakeholder | Role in Workflow | Primary Goal | Current Frustration | What Sugam Sadak Changes |

|---|---|---|---|---|

| Citizen (Ward Resident) | Reports hazards; affected by ongoing works | Fast, safe resolution | No visibility after filing; unsure if already reported by others | Status tracking, closed-loop notification, duplicate detection via passport lookup |

| Ward Junior Engineer (JE) | First responder; inspects, executes minor repairs | A clear, prioritized worklist with context | Arrives on-site with zero history of the road | Passport auto-loads full history before inspection |

| City / Executive Engineer | Approves larger works; allocates ward-level budget | Cross-ward visibility, defensible prioritization | No consolidated view; manual compilation across wards | Health-score-ranked dashboard across all wards |

| Contractor | Executes assigned repair or construction work | Clear scope, timely payment | No standing incentive tied to durability of work | Automated Defect Liability Period (DLP) tracking tied to passport history |

| Department Admin / Commissioner's Office | Owns budget; answerable to council and state | Defensible spend data, fewer escalations | Issues surface only when politically visible, not proactively | Analytics dashboard, exportable audit-ready reports |

| Ward Councillor / Elected Representative | Frequent first point of citizen escalation today | Demonstrate responsiveness to constituents | No system visibility into ward-level status | Read-only ward dashboard (Phase 2) |

| Auditor (Future) | Reviews spend and compliance | Traceable spend-to-outcome linkage | Currently reconstructed manually across paper/siloed systems | Passport provides an audit trail by default |

| State Urban Development Dept. / Smart City SPV (Future) | Potential funder/adopter beyond the pilot | A provable, replicable model | No existing cross-city benchmark on road health | Standardized health score enables cross-city comparison |



\*\*Business Value.\*\* Every MVP feature in Section 15 traces back to a named row in this table — nothing is built because it "sounds complete."



\*\*Government Value.\*\* Naming the Ward Councillor as a stakeholder — even without a Phase 1 feature for them — acknowledges the real political-escalation path that exists in every ULB today, which department evaluators will recognize as accurate rather than idealized.



\*\*Technical Notes.\*\* Role-based access control (Section 15, Section 16) should be designed against these eight roles from the start, even though only four are built into the MVP, so adding a role later is a configuration change, not a schema change.



\*\*MVP Scope.\*\* Citizen, Ward JE, Executive Engineer, and Contractor are the four roles with working software in the SIH demo.



\*\*Future Scope.\*\* Councillor read access, Auditor exports, and State/Smart-City-level aggregated dashboards.



\*\*Possible Risks.\*\* Overpromising Auditor or State-level features in the pitch when only four roles are actually built risks a judge asking to see a role that doesn't exist yet — the Demo Strategy (Part 3) should state explicitly which roles are live.



\---



\## 13. User Personas



\*\*Purpose.\*\* To make the four MVP stakeholder roles concrete enough that every screen designed later has a specific person in mind, not an abstraction.



\*\*Meena, 34 — Ward Resident.\*\* Commutes daily past a stretch of road with a growing pothole cluster near a school. Has reported issues informally to her Ward Councillor's office before, with inconsistent follow-through. Owns a basic Android smartphone; comfortable with apps like payment and grocery delivery, but not power-user. Primary need: report in under a minute, in her own language, and see that it went somewhere real.



\*\*Ravi, 27 — Ward Junior Engineer.\*\* Covers roughly 12–15 km of ward road network. Currently receives assignments via WhatsApp forwards and phone calls from the ward office, with no digital record of what has already been done to a given stretch. Wants to walk up to a site already knowing its repair history so he isn't guessing at cause.



\*\*Ajay — Site Supervisor, municipal roads contractor.\*\* Represents a mid-size contracting firm engaged through the ULB's standard tendering process. Paid on completion certification today, with no system linking his firm's past work quality to future contract eligibility. Currently experiences liability enforcement as inconsistent and personality-dependent (some engineers chase defects, others don't).



\*\*Priya, 41 — Executive Engineer.\*\* Oversees roughly 20 wards' worth of road infrastructure and budget. Spends a disproportionate amount of time each month manually compiling ward-level status for the Commissioner's office from phone calls and spreadsheets. Wants one screen that ranks wards by road health and flags recurring-defect patterns before they become budget overruns.



\*\*Business Value.\*\* These four personas anchor the interface design in Part 3 (Module Specifications) — every screen should be justifiable as "this is what Meena, Ravi, Ajay, or Priya needs to do their specific job."



\*\*Government Value.\*\* Personas grounded in a Junior Engineer's actual daily assignment volume (a ward's worth of road, not an abstract "user") make the workflow design credible to officials who supervise real JEs.



\*\*MVP Scope.\*\* All four personas get working software; Councillor and Auditor personas are deferred to Future Scope (Section 12) and not detailed here to avoid designing screens no one will build for SIH.



\*\*Future Scope.\*\* A Councillor persona and an Auditor persona, once Phase 2 roles are scoped.



\*\*Possible Risks.\*\* Personas this specific can calcify into assumptions that don't hold in the actual pilot city — before build, validate Meena's and Ravi's described technology comfort and workflow against real residents and JEs in the chosen pilot ward if possible.



\---



\## 14. User Journey Maps



\*\*Purpose.\*\* To trace the three journeys that make up the platform's core lifecycle loop, stage by stage, so the Functional Requirements in Section 15 map directly onto real moments rather than generic CRUD screens.



\*\*Journey 1 — Citizen reports a hazard (Meena).\*\*



| Stage | Action | Touchpoint | Pain Today | System Response |

|---|---|---|---|---|

| Notice | Sees pothole on daily commute | Physical road | Uncertain whom to tell | — |

| Report | Opens app, photographs hazard | Citizen App | No app covers her ward's roads today | Auto-detects nearest road via GPS; checks passport for existing open reports at that location |

| Confirm | Sees confirmation with a tracking ID | Citizen App | No tracking ID exists today | Ticket linked to road's passport, not a standalone record |

| Wait | Checks status periodically | Citizen App | No status ever updates | Status changes push a notification (Assigned → Inspected → Work Ordered → Resolved) |

| Resolution | Sees hazard marked fixed, can view before/after photo | Citizen App | No confirmation the work happened | Photo evidence attached to passport; citizen can reopen within a defined window if unresolved |



\*\*Journey 2 — Ward JE handles an assignment (Ravi).\*\*



| Stage | Action | Touchpoint | Pain Today | System Response |

|---|---|---|---|---|

| Assignment | Receives new hazard ticket for his ward | Ward Dashboard | Assignment via phone/WhatsApp, no context | Ticket arrives pre-loaded with the road's full passport history |

| Triage | Checks if this road has recurring issues or is under DLP | Ward Dashboard | No way to know this today | Passport flags "3rd report in 8 months" or "under contractor warranty until \[date]" automatically |

| Inspection | Visits site, logs findings and photos | Mobile Ward App | Paper-based or no record at all | Inspection entry appends to passport's inspection history |

| Action | Executes minor repair directly, or raises a work order | Ward Dashboard | Work order process disconnected from the original complaint | Work order auto-linked to originating hazard report and road ID |

| Closure | Marks complete with photo evidence | Ward Dashboard | Closure often just changes a ticket status, asset record unaffected | Passport's maintenance timeline and health score update automatically |



\*\*Journey 3 — Contractor accountability loop (Ajay).\*\*



| Stage | Action | Touchpoint | Pain Today | System Response |

|---|---|---|---|---|

| Assignment | Receives work order for a repair | Contractor Dashboard | Scope often communicated informally | Digital work order tied to specific road segment and passport |

| Completion | Marks work complete, uploads photo evidence | Contractor Dashboard | Completion is the end of the interaction today | Completion entry starts the DLP countdown against that segment |

| Monitoring | (Passive — no action required unless recurrence) | — | No monitoring exists today | System watches for new hazard reports at the same coordinates during the DLP window |

| Recurrence (if any) | Notified of a new report within the DLP window | Contractor Dashboard | Currently requires a manual dispute/negotiation | Auto-flagged as contractor-chargeable; routed to Executive Engineer for confirmation |



\*\*Business Value.\*\* Journey 3 is the demo moment that makes "accountability" tangible rather than a slide bullet — a judge can watch a simulated recurrence auto-flag against the original contractor in real time.



\*\*Government Value.\*\* Journey 2 directly addresses the Executive Engineer's stated pain point (Section 13) of ward-level status compiled by hand.



\*\*MVP Scope.\*\* All three journeys, built end-to-end for a small demo dataset of realistic (not necessarily live) road segments.



\*\*Future Scope.\*\* A fourth journey for Auditor/State-level review, once those roles are in scope.



\*\*Possible Risks.\*\* Journey 3's auto-flagging logic must have a human confirmation step (Executive Engineer sign-off) before a contractor is formally charged — a fully automated liability determination without human review is both a fairness risk and a likely legal/contractual problem in real deployment.



\---



\## 15. Functional Requirements



\*\*Purpose.\*\* To specify what the MVP software must actually do, grouped by module, each tagged with priority so the 36-hour build has an unambiguous cut line.



\*\*Citizen App\*\*

\- FR-1 (MVP): Submit a hazard report with photo, auto-captured GPS, and category (pothole, cracking, waterlogging, other).

\- FR-2 (MVP): Auto-match the report to the nearest existing road passport; surface any open reports at the same location before submission completes.

\- FR-3 (MVP): View status of a submitted report (Reported → Assigned → Inspected → Work Ordered → Resolved).

\- FR-4 (MVP): Receive a notification on status change.

\- FR-5 (MVP): View a public, read-only summary of any road's passport (health score band, current status, open-issue count — not commercial or contractor details).

\- FR-6 (Phase 2): Reopen a resolved report within a defined window if unresolved.



\*\*Ward / Government Dashboard\*\*

\- FR-7 (MVP): View all hazard reports assigned to the JE's ward, ranked by severity and age.

\- FR-8 (MVP): Open a report and see the full passport of the associated road (history, prior reports, DLP status if applicable).

\- FR-9 (MVP): Log an inspection with notes and photos against a road.

\- FR-10 (MVP): Raise a work order linked to a hazard report and road ID.

\- FR-11 (MVP): Executive Engineer view — all wards ranked by health score, with drill-down.

\- FR-12 (Phase 2): Budget-entry logging against a road's maintenance history.



\*\*Digital Road Passport Core\*\*

\- FR-13 (MVP): Generate and assign a unique Road ID on first inspection or first report against an unregistered road segment.

\- FR-14 (MVP): Store and display construction/specification metadata (length, width, surface type, construction year, agency) where available; allow "unknown/not yet recorded" as a valid state.

\- FR-15 (MVP): Maintain a chronological, append-only history log (hazards, inspections, repairs, contractor assignments).

\- FR-16 (MVP): Compute and display a health score and derived risk level (see Section 17).

\- FR-17 (Phase 2): Full GIS polyline geometry (MVP uses a point/segment reference, not full centerline mapping).



\*\*Contractor Dashboard\*\*

\- FR-18 (MVP): View assigned work orders with scope and linked road passport.

\- FR-19 (MVP): Mark a work order complete with photo evidence, triggering DLP countdown.

\- FR-20 (MVP): View own firm's DLP-linked liability status across assigned roads.

\- FR-21 (Phase 2): Formal dispute/appeal workflow for a contractor-chargeable flag.



\*\*Notifications\*\*

\- FR-22 (MVP): Status-change push notification to the citizen who filed a report.

\- FR-23 (MVP): New-assignment notification to the relevant Ward JE.

\- FR-24 (Phase 2): Escalation notification to Executive Engineer if a ticket exceeds its SLA window.



\*\*Role-Based Access Control\*\*

\- FR-25 (MVP): Four roles (Citizen, Ward JE, Executive Engineer, Contractor) with distinct views and permissions.

\- FR-26 (MVP): Citizens see only the public passport view (FR-5); internal roles see full history.

\- FR-27 (Phase 2): Councillor and Auditor read-only roles.



\*\*Business Value.\*\* The MVP/Phase 2 tagging on every single requirement is the direct enforcement mechanism for the scope discipline argued for in Section 6 and Section 11 — it is not possible to accidentally over-build past the 36-hour window if every requirement already states which bucket it's in.



\*\*Government Value.\*\* FR-2's duplicate detection directly reduces redundant field visits — a concrete efficiency claim, not a vague transparency claim.



\*\*Technical Notes.\*\* FR-13's "generate on first inspection or first report" is the cold-start mechanism designed in Section 6 — no upfront census of existing roads is required to launch.



\*\*MVP Scope.\*\* FR-1 through FR-3, FR-7 through FR-11, FR-13 through FR-16, FR-18 through FR-20, FR-22, FR-23, FR-25, FR-26 — twenty requirements, four roles, one full lifecycle loop.



\*\*Future Scope.\*\* All items tagged Phase 2 above.



\*\*Possible Risks.\*\* FR-2's duplicate-detection matching (same road, nearby but not identical GPS coordinates) needs a defined proximity threshold — get this wrong and either real duplicates go unflagged, or unrelated reports on the same road get incorrectly merged. This threshold should be decided and tested, not left implicit.



\---



\## 16. Non-Functional Requirements



\*\*Purpose.\*\* To specify the quality bar the MVP must meet regardless of feature scope — the requirements a judge won't ask about directly but will notice immediately if they're missing.



\- \*\*Performance:\*\* Citizen App report submission (including photo upload) should complete in under 5 seconds on a typical 4G connection; dashboard views should load in under 2 seconds for a single ward's dataset.

\- \*\*Availability:\*\* MVP targets standard single-instance availability for a demo; Phase 2 targets a defined uptime SLA appropriate to a production civic service.

\- \*\*Security \& Privacy:\*\* Citizen phone numbers, precise home-adjacent GPS traces, and photos are personal data under India's Digital Personal Data Protection (DPDP) Act — the MVP should collect only what FR-1 through FR-5 require, avoid storing citizen location history beyond individual report coordinates, and state a clear data-retention position in the Security Strategy (Part 3).

\- \*\*Usability \& Accessibility:\*\* Citizen App must support at least Hindi and English at MVP, with a design that anticipates further regional languages (Phase 2); UI should not depend on reading dense text to complete a report (icon-first hazard categories).

\- \*\*Offline Tolerance:\*\* A hazard report started with poor connectivity should queue locally and submit when connectivity returns, rather than failing silently — critical given real-world ward-level connectivity variance.

\- \*\*Auditability:\*\* Every write to a road's passport (status change, inspection, work order, completion) is append-only and timestamped; nothing is hard-deleted, only superseded — this is what makes the audit trail claim in Section 9 actually true rather than aspirational.

\- \*\*Interoperability:\*\* All passport data exposed through a documented API from day one, even if no external system consumes it yet — this is what makes future integration with GeoSadak-style systems (Section 10) a configuration exercise rather than a rebuild.

\- \*\*Localization:\*\* Road names, ward names, and addresses should support Devanagari and other regional scripts natively, not transliteration-only.



\*\*Business Value.\*\* Interoperability-by-default (API-first, even unused at MVP) is what lets this pitch credibly claim "we don't replace your existing systems" instead of just asserting it.



\*\*Government Value.\*\* The DPDP-aware data minimization stance directly answers the privacy objection a government evaluator is trained to raise before a citizen-data platform can even be piloted.



\*\*MVP Scope.\*\* Performance targets, basic offline queuing for report submission, Hindi/English support, and append-only history logging.



\*\*Future Scope.\*\* Formal uptime SLA, additional regional languages, a completed DPDP compliance review with legal input.



\*\*Possible Risks.\*\* "DPDP-aligned" is a design posture in this document, not a compliance certification — before any real pilot, the data handling design should be reviewed against the DPDP Act's actual provisions by someone qualified to do so, not inferred from this PRD alone.



\---



\## 17. Digital Road Passport Specification



\*\*Purpose.\*\* To specify the platform's core intellectual property in enough concrete detail that a backend developer could design the schema directly from this section.



\*\*Road ID scheme (proposed).\*\* A hierarchical identifier: `<StateCode>-<ULBCode>-<WardCode>-<SequenceNumber>` — for example, a fourth registered road segment in a given ward would read as a structured code rather than a free-text name. This is a team-designed scheme for the pilot, not a claim of alignment with any existing NRIDA or state numbering standard; if integration with GeoSadak-style systems is pursued later (Section 10), this scheme should be reconciled against whatever official road-coding convention that integration requires.



\*\*Passport data model, by category:\*\*



\*Identity \& Geometry\*

\- Road ID (unique, permanent)

\- Reference point or segment definition (MVP: start-point GPS; Phase 2: full centerline polyline)

\- Ward, zone, and jurisdiction assignment



\*Specification (fields may be "not yet recorded" — see Section 6 on cold start)\*

\- Length, carriageway width, surface type, road classification, construction year, constructing agency



\*Lifecycle History (each an append-only, timestamped log)\*

\- Hazard report history

\- Inspection history

\- Maintenance/repair history (each entry tagged with contractor, cost where available, and DLP status)

\- Contractor assignment history

\- Budget entry history (Phase 2)

\- Photo history (every entry above carries its own geotagged, timestamped photo evidence, not a separate gallery)



\*Computed / Current State\*

\- Health Score (0–100, recalculated on every new event — formula below)

\- Risk Level (derived band: Healthy / Watch / Maintenance Due / Critical)

\- Current Status (Healthy / Under Observation / Work Ordered / Under Repair / Recently Resolved)

\- Active DLP flags (if any open repair is within its contractor warranty window)



\*\*Health Score formula (MVP — explainable, not machine-learned).\*\* Starting from a base of 100:

\- Subtract an age-based depreciation factor (small, capped) if construction year is known.

\- Subtract a per-open-hazard penalty, weighted by declared severity.

\- Subtract a recurrence penalty if a hazard reappears at the same location within a defined window (this is what makes "reappears" visible and score-relevant, not just a work-order footnote).

\- Add a recency-of-maintenance bonus if a repair was completed within a recent window with no subsequent recurrence.



The exact weights are a tuning exercise for the build phase, not fixed here — the requirement is that the formula stays a simple, disclosed weighted sum a citizen or auditor could recompute by hand from the passport's own visible history, deliberately avoiding an opaque ML score at MVP stage.



\*\*Public vs. internal view.\*\* Citizens (FR-5) see: Road ID, current status, health score band (not the precise number, to avoid over-interpretation of small changes), and open-issue count. Internal roles see: full numeric health score, full history, contractor identity and DLP status, and budget data where logged.



\*\*Business Value.\*\* The public/internal view split is what makes the "Transparency" pillar real without exposing commercially sensitive contractor data inappropriately.



\*\*Government Value.\*\* A disclosed, recomputable formula is defensible under RTI-style scrutiny in a way a black-box score is not — this is a direct government-adoption advantage, not just a technical nicety.



\*\*Technical Notes.\*\* Recommended schema shape: a `road\\\_asset` table holding identity/specification/computed-state fields, with `hazard\\\_report`, `inspection`, `maintenance\\\_activity`, `contractor\\\_assignment`, `budget\\\_entry`, and `photo\\\_evidence` as separate tables foreign-keyed to `road\\\_asset.id` — consistent with the asset-first modeling principle established in Section 6. Full table-level design continues in Part 3's Database Planning section.



\*\*MVP Scope.\*\* Identity/geometry (point reference only), specification fields with "unknown" support, all history categories except budget entries, the health score/risk level/status computed fields, and the public/internal view split.



\*\*Future Scope.\*\* Full centerline GIS geometry, budget entry history, ML-assisted health scoring once enough lifecycle data exists to train against, and formal reconciliation with any external road-coding standard.



\*\*Possible Risks.\*\* The recurrence-detection logic underpinning both the health score and DLP flagging (Section 14, Journey 3) depends entirely on the same proximity-matching decision flagged as a risk in Section 15 — get the "same location" threshold wrong and both features degrade simultaneously. This deserves explicit test cases before the demo, not just before production.



\---



\## 18. Complete Module Specifications



\*\*Purpose.\*\* To specify every remaining module named in the original concept brief that Sections 15 and 17 have not already fully covered, and to show how all modules fit together.



\*\*18.1 Module Map\*\*



| Module | Primary Users | Core Function | Depends On |

|---|---|---|---|

| Road Asset Registry | Ward JE, Executive Engineer, Admin | Search, browse, and (when necessary) manually create road\_asset records | Digital Road Passport core (Section 17) |

| Hazard Reporting | Citizen, Ward JE | Intake and lifecycle of a single hazard event | Road Asset Registry, Notification (19) |

| Inspection Workflow | Ward JE | Structured on-site assessment feeding severity and health-score inputs | Hazard Reporting |

| Maintenance Workflow | Ward JE, Executive Engineer, Contractor | Work order → execution → completion → DLP start | Inspection Workflow, Contractor Dashboard |

| Contractor Dashboard | Contractor | View assignments, certify completion, view own DLP status | Maintenance Workflow |

| Analytics Dashboard | Executive Engineer, Admin | Cross-ward and city-level views (Section 20) | Road Asset Registry |

| Notification System | All roles | Event-triggered alerts (Section 19) | All workflow modules |

| Reports | Executive Engineer, Admin, Auditor (future) | Exportable summaries | Analytics Dashboard |

| Audit Log | Admin, Auditor (future) | Immutable, append-only event trail | Every module (every write is logged) |

| RBAC | All roles | Permission enforcement | Foundational — cross-cutting, not a standalone feature |



\*\*18.2 Road Asset Registry.\*\* Search by ward, road name, or Road ID; a map view showing registered roads as pins; manual road creation restricted to Executive Engineer/Admin (to prevent registry spam from citizen-side submissions); a duplicate-merge function, restricted to Admin, for the realistic case where two Road IDs turn out to reference the same physical segment due to imprecise early GPS capture.



\*\*18.3 Hazard Reporting Module.\*\* State machine: `Reported → Duplicate-Checked → Assigned → Inspected → Work Ordered → In Progress → Resolved → (Reopen Window) → Closed`. Each transition has a defined trigger and responsible actor (e.g., `Assigned → Inspected` is triggered by the Ward JE submitting an inspection entry, not by a manual status dropdown — this prevents status drift disconnected from actual field activity).



\*\*18.4 Maintenance Workflow.\*\* Work order fields: scope description, assigned contractor, target completion date, linked hazard report and Road ID. Completion requires photo evidence plus JE sign-off before the record is marked complete — a contractor cannot self-certify completion alone, which is a deliberate accountability control.



\*\*18.5 Inspection Workflow.\*\* Inspection form fields: hazard type, severity (1–5 scale), field notes, photos, and a recommended action (direct minor fix vs. work-order-required). Severity feeds directly into the Health Score formula (Section 17).



\*\*18.6 Reports Module.\*\* Ward Summary Report and City Summary Report, both exportable as PDF/CSV, covering open/resolved counts, average resolution time, and health-score trend for the reporting period. Auditor-facing compliance reports are Phase 2.



\*\*18.7 Audit Log Module.\*\* Every write across every module above appends a log entry (actor, timestamp, action, and, where relevant, before/after state), consistent with the append-only principle established in Section 16. Read access restricted to Admin at MVP.



\*\*18.8 RBAC Permission Matrix\*\*



| Module | Citizen | Ward JE | Executive Engineer | Contractor | Admin |

|---|---|---|---|---|---|

| Road Asset Registry | View (public) | View | View, Create | View (own assignments) | View, Create, Edit |

| Hazard Reporting | Create, View (own) | View, Edit (assigned) | View (all wards) | — | View, Edit |

| Inspection Workflow | — | Create | View | — | View |

| Maintenance Workflow | View (status only) | Create, Edit | Approve | View, Edit (own) | View, Edit |

| Contractor Dashboard | — | — | View | View (own) | View |

| Analytics Dashboard | — | View (own ward) | View (all wards) | — | View |

| Audit Log | — | — | — | — | View |



\*\*Business Value.\*\* The permission matrix above is itself demo-ready evidence of the Accountability pillar — it is one screenshot away from a judge's question about "who can do what."



\*\*Government Value.\*\* Restricting manual road creation and duplicate-merge to Admin/Executive Engineer roles (18.2) directly prevents a plausible abuse vector — citizens flooding the registry with junk entries — without adding friction to the core citizen reporting flow.



\*\*Technical Notes.\*\* The state machine in 18.3 should be implemented as an explicit, enumerated state field with a server-side transition-validation function — not a free-text status column — so an invalid transition (e.g., `Reported → Resolved` with no inspection in between) is rejected at the application layer, not just discouraged by UI convention.



\*\*MVP Scope.\*\* All modules above, with the RBAC matrix's core four roles (Citizen, Ward JE, Executive Engineer, Contractor); Admin exists as a technical role for the demo but is not a separately designed persona (Section 13).



\*\*Future Scope.\*\* Auditor and Councillor rows added to the RBAC matrix; automated compliance report generation.



\*\*Possible Risks.\*\* A rigid state machine is only correct if the real ward workflow doesn't have legitimate exceptions (e.g., an emergency hazard that must skip straight to work order without a formal inspection visit) — Section 21 and the pilot validation process should confirm this against actual departmental practice before the state machine is treated as final.



\---



\## 19. Notification Strategy



\*\*Purpose.\*\* To define what triggers a notification, who receives it, through which channel, and — equally important — what does not trigger one, since notification fatigue is what causes citizens to disable notifications and defeats the entire closed-loop promise (Section 3).



\*\*Triggers and recipients (MVP):\*\*

\- Hazard status change → citizen who filed the report

\- New assignment → the responsible Ward JE

\- Work order marked complete → citizen (closes the loop from Journey 1, Section 14)



\*\*Triggers and recipients (Phase 2):\*\*

\- SLA breach warning (ticket open beyond a defined threshold) → Executive Engineer

\- DLP recurrence flag → both the Contractor and the Executive Engineer (for the human confirmation step required by Section 14's risk note)

\- Ward-level weekly digest → Executive Engineer and, later, Councillor



\*\*Channels.\*\* MVP: in-app and mobile push only. Phase 2: SMS fallback for citizens without reliable data connectivity, and a WhatsApp Business API channel — a channel already familiar to Indian citizens for other civic services, and a realistic lower-friction alternative to a dedicated app for lower-smartphone-comfort users.



\*\*Anti-fatigue policy.\*\* One notification per state transition, never per internal system event; non-urgent updates (e.g., a weekly digest) are batched rather than sent individually; a citizen can mute status updates for a specific report without muting the platform entirely.



\*\*Business Value.\*\* The Phase 2 WhatsApp channel materially widens the citizen base this can reach without requiring app installation — a meaningful adoption lever to mention in the pitch even though it is not built for the MVP demo.



\*\*Government Value.\*\* The SLA-breach escalation to Executive Engineer (Phase 2) is what converts a ward-level backlog from invisible to visible before it becomes a political escalation.



\*\*Technical Notes.\*\* Notifications should be implemented as a subscriber to the same event stream that updates the Road Asset Passport (Section 17) — not as logic duplicated inside each workflow module — so that adding a new trigger later is a new subscriber, not a new integration point in every module.



\*\*MVP Scope.\*\* The three MVP triggers above, in-app and push only.



\*\*Future Scope.\*\* SMS/WhatsApp channels, SLA escalation, DLP-flag notifications, digest emails.



\*\*Possible Risks.\*\* SMS and WhatsApp Business API integration both carry real per-message cost at scale — a detail worth acknowledging in Section 26 (Success Metrics) / budget planning rather than presenting as free infrastructure.



\---



\## 20. Analytics Strategy



\*\*Purpose.\*\* To define which views convert raw passport data into a decision an official can actually act on — analytics for its own sake is not a goal here.



\*\*Core views (MVP-relevant, even if only partially populated for a small demo dataset):\*\*

\- \*\*Ward Health Ranking:\*\* all wards ordered by average road health score, directly serving the Executive Engineer persona's stated pain point (Section 13).

\- \*\*Recurring-Hazard Hotspot View:\*\* roads with more than one hazard report within a defined recent window, surfaced before they become a larger repair.

\- \*\*Contractor Performance Scorecard (Phase 2):\*\* DLP-flag frequency per contractor across all assignments — the analytics-layer counterpart to the accountability promise in Section 14 and Section 17, and a plausible future input to procurement decisions.

\- \*\*Spend-vs-Recurrence View (Phase 2):\*\* roads that have consumed disproportionate repeat-repair budget relative to peers, once budget entries (Section 15, FR-12) are populated.



\*\*Business Value.\*\* The Contractor Performance Scorecard is the analytics view most likely to generate a concrete cost-savings claim ("X% of repeat-repair spend was concentrated in Y% of contractors") once real data accumulates — a genuinely fundable outcome, not just a dashboard.



\*\*Government Value.\*\* The Ward Health Ranking view directly replaces the manual, phone-call-driven compilation process described as Priya's (Executive Engineer) current frustration in Section 13.



\*\*Technical Notes.\*\* All views should be computed from the same underlying passport event history (Section 17) rather than a separately maintained analytics database at MVP scale — introducing a separate analytics pipeline before there is enough data volume to justify one is unnecessary complexity for a pilot of this size.



\*\*MVP Scope.\*\* Ward Health Ranking and Recurring-Hazard Hotspot View, populated from demo data.



\*\*Future Scope.\*\* Contractor Performance Scorecard, Spend-vs-Recurrence View, and — once genuinely warranted by data volume — a dedicated analytics data store separate from the transactional database.



\*\*Possible Risks.\*\* With a small pilot dataset, ranking views can look statistically noisy (one ward with three roads versus another with thirty is not a fair comparison) — the demo should present rankings with this caveat made explicit rather than implying false precision.



\---



\## 21. Security Strategy



\*\*Purpose.\*\* To define the security posture at a level of maturity appropriate to a citizen-data civic platform, without reaching for unjustified complexity.



\*\*Authentication.\*\* OTP-based mobile authentication for citizens — low friction, no password to remember, appropriate for varying levels of digital literacy. Credentialed login for government and contractor roles, with Phase 2 potential to federate against a state's existing government SSO/directory rather than maintaining a separate credential store long-term.



\*\*Authorization.\*\* Enforced server-side against the RBAC matrix (Section 18.8) on every API call — not just hidden in the UI — so a request from an unauthorized role is rejected at the API layer regardless of client-side behavior.



\*\*Data protection.\*\* Encryption in transit (TLS) and at rest for the database and photo storage; minimal PII collection consistent with the DPDP-aligned posture in Section 16; photo metadata (which can include embedded location/device data) stripped of anything beyond what the platform itself needs before any public-facing display.



\*\*Tamper-evidence for the audit log.\*\* Each audit log entry stores a hash of the previous entry, making retroactive tampering detectable without needing a distributed ledger. This is deliberately \*\*not\*\* described as "blockchain" — a hash-chained append log achieves the tamper-evidence property this platform actually needs at a fraction of the operational complexity, and SIH judges are generally unimpressed by blockchain claims that don't hold up under a "why does this specific problem need a distributed ledger" follow-up question.



\*\*Known limitations, stated honestly rather than hidden.\*\* GPS location can be spoofed by a determined citizen; the MVP mitigates this by requiring in-app photo capture (not gallery upload) so a photo's own metadata can be cross-checked against the declared location, but this is a mitigation, not a guarantee, and should be described as such in any pitch.



\*\*Business Value.\*\* Explicitly naming what the security model does \*not\* solve (GPS spoofing) is a credibility signal, not a weakness to hide — judges with real technical background distrust claims of airtight security more than they distrust an honestly scoped limitation.



\*\*Government Value.\*\* A stated, defensible position on citizen data handling is a prerequisite most government evaluators will look for before treating a citizen-facing pilot proposal as serious at all.



\*\*Technical Notes.\*\* Rate-limiting on hazard report submission (Section 15's FR-1) is a necessary companion control to the duplicate-detection logic (FR-2) — without it, a small number of malicious or automated submissions could distort the health score and hotspot analytics before duplicate-detection even has a chance to catch them.



\*\*MVP Scope.\*\* OTP citizen auth, credentialed staff/contractor auth, server-side RBAC enforcement, TLS everywhere, and the hash-chained audit log.



\*\*Future Scope.\*\* Government SSO federation, formal penetration testing before any real pilot deployment, and a full DPDP compliance review (Section 16).



\*\*Possible Risks.\*\* Security posture described in a PRD is not the same as security posture verified by testing — this section should be treated as a design specification to build against, not a claim to make to a government partner without an actual review.



\---



\## 22. Database Planning



\*\*Purpose.\*\* To specify a concrete, developer-usable schema plan consistent with the asset-first data model principle established in Section 6.



\*\*Core tables\*\*



| Table | Key Fields | Relationships |

|---|---|---|

| `road\\\_asset` | id, road\_code, ward\_id, reference\_point (geometry), specification fields, health\_score, risk\_level, status | Root entity — all history tables FK to this |

| `hazard\\\_report` | id, road\_asset\_id, citizen\_user\_id, category, severity, status, created\_at | FK → road\_asset, FK → user\_account |

| `inspection` | id, hazard\_report\_id, ward\_je\_user\_id, severity, notes, created\_at | FK → hazard\_report, FK → user\_account |

| `maintenance\\\_activity` | id, hazard\_report\_id, contractor\_assignment\_id, completion\_date, dlp\_expiry\_date | FK → hazard\_report, FK → contractor\_assignment |

| `contractor\\\_assignment` | id, contractor\_org\_id, road\_asset\_id, scope, target\_date | FK → road\_asset |

| `budget\\\_entry` (Phase 2) | id, road\_asset\_id, amount, source, entry\_date | FK → road\_asset |

| `photo\\\_evidence` | id, parent\_table, parent\_id, url, geotag, captured\_at | Polymorphic FK to any history record above |

| `user\\\_account` | id, role, ward\_id (if applicable), auth\_identifier | Referenced by all above |

| `ward` | id, name, zone, jurisdiction\_type | Referenced by road\_asset, user\_account |

| `audit\\\_log` | id, actor\_id, action, table\_name, record\_id, before\_state, after\_state, prev\_entry\_hash, created\_at | Append-only, references all tables generically |



\*\*Indexing strategy.\*\* A geospatial index (PostGIS `GIST`) on `road\\\_asset.reference\\\_point` to support FR-2's nearest-road/duplicate matching; a standard index on `ward\\\_id` across tables queried by the ward dashboard; a composite index on `hazard\\\_report.status` and `road\\\_asset\\\_id` for worklist queries.



\*\*Business Value.\*\* Recommending PostgreSQL with the PostGIS extension is a deliberate, defensible choice — free, open-source, extremely well documented, and purpose-built for exactly the geospatial matching this platform depends on (FR-2, Section 20's hotspot view) — rather than an unjustified or exotic database choice a judge would need explained.



\*\*Government Value.\*\* An open-source database stack avoids licensing cost as an adoption barrier for a cash-constrained municipal IT budget.



\*\*Technical Notes.\*\* `road\\\_asset`'s computed fields (`health\\\_score`, `risk\\\_level`, `status`) are denormalized, recalculated by an application-layer job whenever a new event is written to any history table — consistent with keeping the Health Score formula (Section 17) simple and recomputable rather than dependent on an opaque background pipeline.



\*\*MVP Scope.\*\* All tables above except `budget\\\_entry`.



\*\*Future Scope.\*\* `budget\\\_entry`, plus a separate analytics read-replica once data volume justifies one (Section 20).



\*\*Possible Risks.\*\* The polymorphic `photo\\\_evidence.parent\\\_table` design is a common source of referential-integrity bugs if not enforced carefully at the application layer — worth flagging to whoever implements it rather than treating as a trivial detail.



\---



\## 23. API Planning



\*\*Purpose.\*\* To define the API surface as a versioned REST interface — the simplest, most demoable, and most broadly understood choice for a 36-hour build, and consistent with the interoperability-by-default non-functional requirement (Section 16).



\*\*Representative endpoints (all under an `/api/v1/` prefix from day one):\*\*



| Endpoint | Method | Purpose | Access |

|---|---|---|---|

| `/roads` | GET | Search/list road assets by ward, name, or ID | Public (limited fields) / Internal (full) |

| `/roads/{id}` | GET | Full passport for a single road | Public (limited) / Internal (full) |

| `/roads/{id}/history` | GET | Chronological event history | Internal only |

| `/roads` | POST | Manually create a road asset | Executive Engineer, Admin |

| `/hazard-reports` | POST | Submit a new hazard report | Citizen |

| `/hazard-reports?ward={id}` | GET | List reports for a ward | Ward JE, Executive Engineer |

| `/hazard-reports/{id}` | PATCH | Update status | Ward JE (assigned only) |

| `/inspections` | POST | Log an inspection | Ward JE |

| `/work-orders` | POST | Create a work order | Ward JE |

| `/work-orders/{id}/complete` | PATCH | Certify completion | Contractor + Ward JE sign-off |

| `/contractors/{id}/dlp-status` | GET | View DLP liability status | Contractor (own), Executive Engineer |



\*\*Business Value.\*\* A clean, versioned, documented API is itself a pitch asset — it is the concrete evidence behind the claim (Section 9, Section 10) that this platform is designed to interoperate with GeoSadak/OMMAS-style systems rather than compete with them.



\*\*Government Value.\*\* A public read-only subset of `/roads` and `/roads/{id}` is what makes the Transparency pillar (Section 6) a real, externally verifiable capability rather than an internal dashboard claim.



\*\*Technical Notes.\*\* Authentication via JWT session tokens carrying a role claim, checked against the RBAC matrix (Section 18.8) on every request server-side — never trusting a client-supplied role.



\*\*MVP Scope.\*\* All endpoints listed above except budget-related endpoints (deferred with `budget\\\_entry`, Section 22).



\*\*Future Scope.\*\* Webhook-based push notifications to external systems (rather than only polling), and formal OpenAPI documentation published for potential integration partners.



\*\*Possible Risks.\*\* A public API exposing even limited road-health data needs rate limiting and caching from day one — an unthrottled public endpoint on a citizen-facing civic platform is a realistic availability risk, not a hypothetical one.



\---



\## 24. High-Level Architecture



\*\*Purpose.\*\* To describe an architecture appropriately sized for a 36-hour hackathon build with a credible path to production — deliberately avoiding the common failure mode of over-architecting a student project with infrastructure complexity the team cannot actually demonstrate the value of.



\*\*Layered view:\*\*



\- \*\*Client Layer:\*\* Citizen Mobile App (Android-first, with a Progressive Web App fallback for broader low-end-device reach); Government Web Dashboard (Ward JE and Executive Engineer views); Contractor Web Portal.

\- \*\*API Layer:\*\* Versioned REST API (Section 23); authentication service (OTP for citizens, credentialed login for staff/contractors); notification dispatcher (Section 19), implemented as a subscriber to passport write events rather than logic embedded in each module.

\- \*\*Application Layer:\*\* Road Passport service (health score computation, DLP tracking, duplicate/proximity matching); Workflow engine enforcing the hazard-report state machine (Section 18.3).

\- \*\*Data Layer:\*\* PostgreSQL with PostGIS (Section 22) as the primary transactional store; object storage (S3-compatible) for photo evidence; the audit log (Section 21) as an append-only table, logically separated from mutable application tables even if physically co-located at MVP scale.

\- \*\*Integration Layer (future, not MVP):\*\* Adapters for ingesting GeoSadak/GRRIS open GIS layers (Section 10) as registry bootstrap data; potential future hooks toward GEM (contractor procurement) and PFMS (fund flow) — named here as roadmap awareness, not claimed as built integrations.



\*\*Deployment posture.\*\* Cloud-agnostic by design — containerized services deployable on standard cloud infrastructure, and, notably, on government-empanelled infrastructure such as NIC's MeghRaj cloud initiative, which matters directly for real government procurement and data-residency requirements rather than being a generic afterthought.



\*\*Business Value.\*\* A single well-structured monolith-with-clear-seams, not a microservices architecture, is the right engineering call for this MVP's actual scale — and stating that explicitly, with reasoning, reads as engineering maturity to a technically literate judge, rather than as a lack of ambition.



\*\*Government Value.\*\* Deployment-target awareness (MeghRaj / empanelled government cloud) signals the team has thought past the demo toward what real government IT procurement actually requires.



\*\*Technical Notes.\*\* The Application Layer's Road Passport service is the one component worth keeping cleanly separated from the rest of the codebase even in a monolith — it is the reusable core that would need to survive a future move toward a genuinely modular or multi-jurisdiction architecture (Section 6, Future Scope).



\*\*MVP Scope.\*\* Client Layer (Citizen App + Government Dashboard + Contractor Portal), API Layer, Application Layer, and Data Layer, deployed as a single well-organized application rather than a distributed system.



\*\*Future Scope.\*\* The Integration Layer, and — only once real usage data justifies it — selective decomposition of the Road Passport service into an independently scalable component.



\*\*Possible Risks.\*\* The most likely architecture-related judging critique is the inverse of over-engineering: appearing to have "just a CRUD app." The Health Score formula (Section 17), the DLP-triggered accountability logic (Section 14), and the duplicate-detection matching (Section 15) are the three pieces of actual logic that distinguish this from a form-and-database app, and the demo (Part 4) should foreground exactly those three, not the CRUD screens around them.



\---



\*End of Part 3. Sections 25 onward (Future Scalability, Success Metrics, Risks, Future Scope, Demo Strategy, SIH Winning Strategy, Judge Questions, Appendix) form the final installment.\*



