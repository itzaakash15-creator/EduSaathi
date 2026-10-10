from __future__ import annotations

from typing import Any

from app.schemas import (
    ApplicationRoadmap,
    CareerAdvice,
    ChatReply,
    Course,
    DocumentExplanation,
    FAQ,
    RoadmapStep,
)


def fallback_document_explanation() -> DocumentExplanation:
    return DocumentExplanation(
        summary=(
            "This government notification outlines a public benefit or opportunity scheme, "
            "including who can apply, what support is offered, and how to submit an application "
            "through the official portal."
        ),
        eligibility=[
            "Applicant must be an Indian citizen with valid identity proof",
            "Income and category criteria as stated in the notification",
            "Enrollment or occupational status matching the scheme scope",
            "Submission before the published deadline",
        ],
        required_documents=[
            "Aadhaar Card",
            "Income Certificate (if income-based)",
            "Educational / occupational proof",
            "Bank passbook or cancelled cheque",
            "Passport-size photograph",
        ],
        deadline="Refer to the notification — typically 30–60 days from publication",
        important_notes=[
            "Only applications on the official portal are valid",
            "Keep scanned documents under the specified file size",
            "Name on Aadhaar and bank account must match",
            "Beware of third-party agents charging fees for free schemes",
        ],
        action_checklist=[
            "Confirm eligibility against each criterion",
            "Collect and scan all required documents",
            "Create / login to the official portal account",
            "Fill the form carefully and review before submit",
            "Note the application reference number",
            "Set a calendar reminder for verification follow-up",
        ],
        faqs=[
            FAQ(
                question="Is there an application fee?",
                answer=(
                    "Most government schemes are free to apply. Ignore any website asking for "
                    "payment unless the official notification explicitly mentions a fee."
                ),
            ),
            FAQ(
                question="What if my documents are in a regional language?",
                answer=(
                    "Many portals accept regional documents. If English translation is required, "
                    "get it notarized as specified."
                ),
            ),
            FAQ(
                question="Can I edit after submission?",
                answer=(
                    "Usually limited edits are allowed before institute/authority verification. "
                    "Check the portal's edit window."
                ),
            ),
        ],
    )


def fallback_roadmap(
    opportunity_id: str,
    profile: dict[str, Any] | None = None,
) -> ApplicationRoadmap:
    _ = profile  # reserved for future personalization
    title = _title_for_opportunity(opportunity_id)
    default_documents = [
        "Aadhaar",
        "Income Certificate",
        "Latest mark sheets",
        "Bank passbook",
    ]

    return ApplicationRoadmap(
        opportunity_title=title,
        total_days=14,
        steps=[
            RoadmapStep(
                title="Confirm eligibility",
                description=(
                    "Review each eligibility criterion against your profile and gather proof "
                    "for edge cases."
                ),
                estimated_days=1,
                documents=["Profile details", "Identity proof"],
                tips=["Screenshot official eligibility text for reference"],
            ),
            RoadmapStep(
                title="Assemble documents",
                description=(
                    "Collect, scan, and name documents clearly. Verify file formats and size limits."
                ),
                estimated_days=3,
                documents=default_documents,
                tips=["Use PDF under 1–2 MB", "Ensure names match across documents"],
            ),
            RoadmapStep(
                title="Create portal account",
                description=(
                    "Register on the official application portal and complete profile KYC."
                ),
                estimated_days=1,
                documents=["Aadhaar", "Mobile number", "Email"],
                tips=["Enable SMS/email alerts from the portal"],
            ),
            RoadmapStep(
                title="Fill and review application",
                description=(
                    "Enter academic, bank, and personal details. Double-check income and category fields."
                ),
                estimated_days=2,
                documents=["All scanned files"],
                tips=["Save draft frequently", "Ask a mentor to review before final submit"],
            ),
            RoadmapStep(
                title="Submit and track",
                description=(
                    "Submit the application, save the reference ID, and monitor verification status."
                ),
                estimated_days=7,
                documents=["Application receipt"],
                tips=["Follow up with institute nodal officer if stuck on verification"],
            ),
        ],
        success_tips=[
            "Apply at least 7 days before the deadline",
            "Keep digital and physical copies of every upload",
            "Never share OTP or passwords with agents",
            "Use CivicBridge reminders for verification follow-ups",
        ],
    )


def fallback_career_advice(profile: dict[str, Any] | None = None) -> CareerAdvice:
    _ = profile
    return CareerAdvice(
        skills=[
            "Data Structures & Algorithms",
            "Cloud fundamentals (AWS/GCP)",
            "Technical writing for grant proposals",
            "System design basics",
        ],
        certifications=[
            "Google Data Analytics Certificate",
            "AWS Cloud Practitioner",
            "NPTEL Machine Learning",
        ],
        courses=[
            Course(
                title="Full-Stack Web Development",
                provider="NASSCOM Futureskills / freeCodeCamp",
                reason="Strengthens internship and hackathon competitiveness",
            ),
            Course(
                title="Research Methodology",
                provider="SWAYAM / NPTEL",
                reason="Improves readiness for fellowships and INSPIRE-track paths",
            ),
            Course(
                title="Startup Finance Basics",
                provider="Startup India Learning Program",
                reason="Helps qualify for seed fund documentation quality",
            ),
        ],
        projects=[
            "Build a campus grievance chatbot and publish on GitHub",
            "Contribute to an open-source civic-tech repository",
            "Complete a Kaggle beginner notebook with a public write-up",
        ],
        eligibility_impact=(
            "Completing 2 certifications and 1 public project can raise your internship and "
            "scholarship match scores by an estimated 8–12 points."
        ),
    )


def fallback_chat(
    messages: list[dict[str, str]],
    profile: dict[str, Any] | None = None,
) -> ChatReply:
    profile = profile or {}
    last = (messages[-1].get("content") or "").lower()

    name = profile.get("name", "Demo User")
    education = profile.get("education", "B.Tech Computer Science")
    state = profile.get("state", "Andhra Pradesh")
    occupation = profile.get("occupation", "Student")
    income = profile.get("income", "Below 8 LPA")

    if "eligible" in last or "schemes" in last:
        return ChatReply(
            reply=(
                f"Based on your profile ({education}, {state}, income {income}), "
                "you currently match well with several government opportunities including "
                "scholarships, internships, and skill-development schemes.\n\n"
                "• **National Scholarship Portal (NSP)** — Likely Eligible, 92% match\n"
                "• **PM Internship Scheme** — Eligible, 88% match\n"
                "• **Startup India Seed Fund** — Likely Eligible, 75% match\n"
                "• **Skill India Digital Hub** — Eligible, 82% match\n\n"
                "I recommend starting with the highest match scores and confirming documents "
                "in your vault before applying."
            )
        )

    if "document" in last:
        return ChatReply(
            reply=(
                "For most scholarships and internships matching your profile, keep these ready:\n\n"
                "• Aadhaar Card\n"
                "• Income Certificate (current FY)\n"
                "• Latest mark sheets\n"
                "• Student ID / Bonafide certificate\n"
                "• Bank passbook\n"
                "• Updated resume\n\n"
                "Your Document Vault already has 5 files. Mark sheets pending verification "
                "should be re-uploaded as clear PDFs under 1 MB."
            )
        )

    if "deadline" in last:
        return ChatReply(
            reply=(
                "Upcoming deadlines relevant to you:\n\n"
                "• **National Scholarship Portal** — 2026-08-31\n"
                "• **PM Internship Scheme** — 2026-09-15\n"
                "• **INSPIRE Fellowship** — 2026-10-01\n"
                "• **Startup India Seed Fund** — 2026-09-30\n\n"
                "Enable notifications to get reminders 7 days and 48 hours before each deadline."
            )
        )

    return ChatReply(
        reply=(
            "I can help you discover opportunities, check eligibility, explain government PDFs, "
            "build application roadmaps, and track deadlines.\n\n"
            "Try asking:\n"
            "• \"What schemes am I eligible for?\"\n"
            "• \"What documents do I need for NSP?\"\n"
            "• \"When is the PM Internship deadline?\"\n\n"
            f"Your profile is set as {name}, {occupation} from {state}."
        )
    )


def _title_for_opportunity(opportunity_id: str) -> str:
    titles = {
        "opp-nsp": "National Scholarship Portal (NSP)",
        "opp-pm-internship": "PM Internship Scheme",
        "opp-inspire": "INSPIRE Fellowship",
        "opp-startup-seed": "Startup India Seed Fund",
        "opp-skill-india": "Skill India Digital Hub",
        "opp-pm-kisan": "PM-KISAN",
        "opp-ayushman": "Ayushman Bharat",
        "opp-mudra": "PM MUDRA Yojana",
    }
    return titles.get(opportunity_id, "Selected Opportunity")
