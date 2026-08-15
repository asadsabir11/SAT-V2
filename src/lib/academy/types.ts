/**
 * The Digital Tutor Academy — data model (additive).
 *
 * This layer sits ALONGSIDE the existing SAT product. It introduces the umbrella
 * "Academy" concept: multiple Programs (SAT, O Level, future A Level…), each with
 * Subjects, Cohorts, Pricing, Tracks, and Instructors.
 *
 * Everything the marketing pages render (subjects, prices, schedules, cohorts) is
 * defined as DATA in lib/academy/data.ts so new subjects/programs can be added
 * without touching component code.
 */

export type ProgramKey = "sat" | "o-level" | "a-level" | "foundation";

/** A live-class or workshop slot template (configurable — no fixed dates here). */
export interface ClassSlot {
  title: string;
  durationMins: number;
  type: "concept" | "workshop" | "practical" | "revision" | "office-hours";
  cadence: string; // e.g. "Weekly"
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  teaches: string[];
  highlights: string[];
  /** Optional path under /public, e.g. "/ibrahim.jpg". Falls back to initials if unset. */
  photoUrl?: string;
}

export interface Subject {
  slug: string;
  name: string;
  program: ProgramKey;
  /** Human reference only, e.g. "Cambridge O Level Mathematics". Not fabricated specs. */
  syllabusRef?: string;
  /** Optional Cambridge syllabus code, stored as editable config. */
  syllabusCode?: string;
  short: string;
  description: string;
  forWho: string[];
  /** Indicative, editable topic areas — NOT an official syllabus reproduction. */
  indicativeTopics: string[];
  learningOutcomes: string[];
  classModel: ClassSlot[];
  assessmentApproach: string;
  instructorId: string;
  comingSoon?: boolean;
  faqs?: { q: string; a: string }[];
}

export type ExamSession = string; // e.g. "May/June 2027"

export type CohortStatus = "enrolling" | "waitlist" | "full" | "planned";

export interface Cohort {
  id: string;
  program: ProgramKey;
  subjectSlug: string;
  instructorId: string;
  targetExam: ExamSession;
  /** Human-readable schedule label; keep concrete dates out of components. */
  scheduleLabel: string;
  status: CohortStatus;
  capacity: number;
  enrolled: number;
}

export interface PricingTier {
  subjects: number; // 1..5
  price: number; // in the schedule's currency, integer
  label?: string;
}

export interface PricingSchedule {
  id: string;
  label: string; // "Founding cohort", "Standard"
  currency: string; // "PKR"
  active: boolean; // exactly one active per program controls what's shown
  note?: string;
  tiers: PricingTier[];
}

export interface Track {
  id: string;
  name: string;
  description: string;
  subjectSlugs: string[];
  future?: boolean;
}

export interface OfficeHoursInfo {
  headline: string;
  blurb: string;
  canDo: string[];
  staffing: string; // who runs them, kept editable
}
