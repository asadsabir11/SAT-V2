/**
 * Parent-facing guides (SEO Phase 2 §23) — near-purchase informational pages
 * that lead toward the commercial O Level pages.
 *
 * Editing rule: every concrete number here (prices, class times, dates, class
 * size, refund window) is duplicated from the real source of truth elsewhere
 * in the codebase — PRICING_SCHEDULES in academy/data.ts, COHORT_SCHEDULE and
 * FAQ_ITEMS in app/o-level/page.tsx, and the refund-policy page. If any of
 * those change, change them here too.
 *
 * Deliberately NOT included: competitor or market-average tuition rates, and
 * study-hour statistics. §34 forbids invented content, and a parent-facing
 * page is exactly where a fabricated figure would do the most damage.
 */

export interface GuideSection {
  h2: string;
  body: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  /** H1 — question-shaped, matching how parents actually search. */
  h1: string;
  seoTitle: string;
  description: string;
  /** Short label for the hub page and breadcrumbs. */
  navLabel: string;
  intro: string;
  sections: GuideSection[];
  faqs?: { q: string; a: string }[];
  cta: { heading: string; body: string; href: string; label: string };
}

export const GUIDES: Guide[] = [
  {
    slug: "o-level-tuition-cost-pakistan",
    h1: "How Much Does O Level Tuition Cost in Pakistan?",
    seoTitle: "O Level Tuition Fees in Pakistan | What to Expect",
    description:
      "What O Level tuition costs in Pakistan, what actually drives the price, and how per-subject and multi-subject pricing compares. Includes The Digital Tutor's published monthly fees.",
    navLabel: "O Level tuition cost",
    intro:
      "O Level tuition in Pakistan is priced in several different ways, which makes comparing quotes harder than it should be. Some tutors charge per hour, some per subject per month, and some quote a single figure for a whole package without saying how many subjects or contact hours it covers. Before comparing two prices, it is worth understanding what each one actually buys.",
    sections: [
      {
        h2: "What actually drives the price",
        body: [
          "Almost all of the variation in O Level tuition pricing comes down to five things. When a quote looks unusually cheap or unusually expensive, it is normally because of one of these rather than because of teaching quality.",
        ],
        bullets: [
          "One-to-one versus group teaching. Individual tuition costs considerably more per hour, because the teacher's time is not shared.",
          "Class size. A group of six and a group of forty are both sold as group tuition, but they are very different products.",
          "Contact hours per week. One 60-minute session a week, and two sessions plus separate support time, are not comparable even at the same monthly price.",
          "Number of subjects. Per-subject pricing usually falls as you add subjects, so the second and third subject often cost less than the first.",
          "Online versus in-person. In-person tuition carries travel cost and time for somebody — either the tutor or the student — and that is normally reflected in the fee.",
        ],
      },
      {
        h2: "Per-hour, per-subject or per-month?",
        body: [
          "Per-hour pricing looks transparent but hides how much teaching your child actually gets. Two hours a week at a low hourly rate can cost more per month than a structured programme quoted monthly, and gives you less certainty about what is covered.",
          "Monthly per-subject pricing is usually easier to compare, provided you also ask how many sessions that month includes, whether support between sessions is included, and what happens if a class is missed.",
        ],
      },
      {
        h2: "What The Digital Tutor charges",
        body: [
          "For transparency, here is our published founding-cohort pricing. It is monthly, per student, and covers Cambridge O Level teaching for the subjects selected.",
        ],
        bullets: [
          "1 subject — PKR 10,000 per month",
          "2 subjects — PKR 18,000 per month",
          "3 subjects — PKR 24,000 per month",
          "4 subjects — PKR 29,000 per month",
          "5 subjects — PKR 34,000 per month",
        ],
      },
      {
        h2: "What that fee includes",
        body: [
          "The monthly fee is not only class time. For each subject it covers a weekly live class, open office hours between classes, past-paper and exam-style practice, and regular progress reporting to parents.",
          "Classes are capped at 15 students, so it is a small-group programme rather than a lecture. Registration itself is free — you create an account, look around, and pay only when you decide to unlock a subject.",
        ],
        bullets: [
          "Weekly live class with the instructor, not a recording",
          "Open office hours, Monday to Friday, 7:30–8:15 PM PKT",
          "Past-paper and exam-technique practice",
          "Homework with feedback",
          "Regular parent progress reports covering attendance, homework and focus areas",
          "Maximum 15 students per class",
        ],
      },
      {
        h2: "Questions worth asking any tutor before you pay",
        body: [
          "Whichever provider you choose, these questions tend to separate a structured programme from an informal arrangement.",
        ],
        bullets: [
          "How many students are in the class?",
          "How many contact hours per week does the fee cover?",
          "What happens if my child is stuck between classes?",
          "Which Cambridge syllabus code are you teaching to?",
          "How, and how often, will I hear about my child's progress?",
          "What is the refund or cancellation policy?",
        ],
      },
      {
        h2: "If the fee is the obstacle",
        body: [
          "Cost should not be the reason a capable student misses out. We run an Opportunity Scholarship for students who demonstrate financial need alongside a genuine commitment to the work, and applications are reviewed individually.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is O Level tuition cheaper online than in person?",
        a: "Usually, yes — there is no travel cost and no premises to pay for. The trade-off is that the student needs a reliable internet connection and a quiet place to work.",
      },
      {
        q: "Do I pay per subject or for the whole programme?",
        a: "We price per subject per month, and the rate per subject falls as you add more. One subject is PKR 10,000 a month; three subjects together are PKR 24,000 a month rather than PKR 30,000.",
      },
      {
        q: "Is there anything to pay before classes start?",
        a: "Registration is free. You pay only when you choose to unlock a subject, and that subject becomes available once the payment is verified.",
      },
      {
        q: "What if we change our mind?",
        a: "If you cancel within 7 days of your first payment you receive a 100% refund. The full terms are on our Refund and Cancellation Policy page.",
      },
    ],
    cta: {
      heading: "See the current O Level cohorts",
      body: "Class times, syllabus codes, cohort dates and per-subject pricing for English Language, Mathematics and Computer Science.",
      href: "/o-level",
      label: "View O Level programme",
    },
  },
  {
    slug: "online-vs-home-o-level-tuition",
    h1: "Online vs Home Tuition for O Levels: Which Works Better?",
    seoTitle: "Online vs Home Tuition for O Levels | Honest Comparison",
    description:
      "A practical comparison of online and home tuition for Cambridge O Level students in Pakistan — cost, supervision, class size, flexibility, and where each genuinely works better.",
    navLabel: "Online vs home tuition",
    intro:
      "Home tuition has been the default for O Level students in Pakistan for a long time, and for good reasons. Online tuition is not automatically better — but it is genuinely better at some things and worse at others. It is worth being clear about which is which before deciding.",
    sections: [
      {
        h2: "Where home tuition is stronger",
        body: [
          "A tutor sitting in the room with your child has advantages that are difficult to replicate remotely, and it would be dishonest to pretend otherwise.",
        ],
        bullets: [
          "Physical presence tends to hold the attention of a younger or easily distracted student better.",
          "The tutor sees the working on the page immediately, without waiting for it to be photographed or shared.",
          "There is no dependency on internet quality, or on the student being comfortable with the technology.",
          "For a student who is significantly behind, individual attention in the room is hard to beat.",
        ],
      },
      {
        h2: "Where online tuition is stronger",
        body: [
          "Online teaching removes travel entirely, which changes both the economics and what is practical to offer.",
        ],
        bullets: [
          "No travel time or cost for either party, which usually means a lower fee for the same teaching.",
          "Access to a specialist teacher who is not within driving distance of your home.",
          "Support between classes becomes practical — office hours cost nothing to attend from home, whereas a second home visit costs a second fee.",
          "Written material and worked solutions are shared instantly.",
          "Scheduling is easier, because nobody is crossing a city in traffic.",
        ],
      },
      {
        h2: "The question that matters more than the format",
        body: [
          "In practice the format matters less than whether the arrangement is structured. A structured programme has a fixed weekly rhythm, homework that is actually marked, a way for the student to get help when stuck, and a way for parents to see what is happening.",
          "An unstructured arrangement — online or at home — tends to drift into whatever the student brings that week, and by the time the exam approaches it is difficult to say what has been covered.",
        ],
      },
      {
        h2: "How our online model is set up",
        body: [
          "We run small live classes rather than recordings, capped at 15 students, with open office hours between classes so a student who is stuck does not have to wait a week for the next session.",
        ],
        bullets: [
          "Mathematics — Saturdays, 6:00–7:00 PM PKT",
          "English Language — Fridays, 6:00–7:00 PM PKT",
          "Computer Science — Thursdays, 6:00–7:00 PM PKT",
          "Office hours — Monday to Friday, 7:30–8:15 PM PKT",
        ],
      },
      {
        h2: "What you need for online tuition to work",
        body: [
          "Online tuition fails in predictable ways, and most of them are avoidable.",
        ],
        bullets: [
          "A stable internet connection at the class time, not just in general.",
          "A quiet place to sit, with the door closed, for the length of the class.",
          "A device with a working microphone — a student who cannot ask a question out loud will stop asking.",
          "Paper and pen. Mathematics and English both still need writing by hand, because the exam does.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is online tuition effective for O Level Mathematics?",
        a: "Yes, provided the class is live and small enough for the teacher to see and respond to student work. Where online struggles is in very large groups, where a student can sit silently for an hour without anyone noticing.",
      },
      {
        q: "What if my child is too shy to speak up in an online class?",
        a: "This is a genuine risk, and one reason we cap classes at 15 and run separate office hours. A quieter student will often ask in office hours what they would not ask in front of the class.",
      },
      {
        q: "Can we combine both?",
        a: "Many families do — a structured online programme for the syllabus and exam technique, with occasional in-person help for a specific weak area.",
      },
    ],
    cta: {
      heading: "See how the online classes run",
      body: "Weekly live classes, open office hours, past-paper practice and parent progress reports for Cambridge O Level.",
      href: "/o-level",
      label: "View O Level programme",
    },
  },
  {
    slug: "how-to-choose-o-level-tutor",
    h1: "How to Choose an O Level Tutor",
    seoTitle: "How to Choose an O Level Tutor | Parent's Checklist",
    description:
      "A practical checklist for choosing a Cambridge O Level tutor — syllabus codes, class size, past-paper practice, feedback, progress reporting, and the questions worth asking first.",
    navLabel: "Choosing a tutor",
    intro:
      "Most parents choose a tutor on a recommendation and a price, then find out months later whether it was working. A handful of questions asked at the start tell you far more than either of those, and they take about ten minutes to ask.",
    sections: [
      {
        h2: "Check the syllabus code, not just the subject",
        body: [
          "Cambridge publishes different syllabuses under similar names, and a tutor comfortable with one may not be teaching the one your child is entered for. Ask which code they teach to, and check it against your child's school.",
        ],
        bullets: [
          "Mathematics — Cambridge O Level 4024",
          "English Language — Cambridge O Level 1123",
          "Computer Science — Cambridge O Level 2210",
        ],
      },
      {
        h2: "Ask how past papers are used",
        body: [
          "Past-paper practice is the clearest single indicator of whether a student is being prepared for the exam rather than just taught the content. The answer you want is that past papers run throughout, not that they are saved for the final few weeks.",
          "It is also worth asking what happens after a past paper — whether it is marked, whether mistakes are reviewed individually, and whether the student sees the mark scheme.",
        ],
      },
      {
        h2: "Ask what happens when your child is stuck",
        body: [
          "This is the question that most distinguishes one arrangement from another. A student who hits a wall on Tuesday and cannot ask until Saturday has lost most of the week.",
          "Good answers include scheduled office hours, a way to send a question between sessions, or a support channel with a defined response time. A vague answer usually means the honest answer is that they wait.",
        ],
      },
      {
        h2: "Ask about class size, and what the number includes",
        body: [
          "Group tuition can mean six students or sixty. Ask for the cap rather than the average, and ask whether that cap is enforced.",
        ],
      },
      {
        h2: "Ask how you will hear about progress",
        body: [
          "Without reporting, most parents find out how things are going at the mock exam, which is too late to change anything. Ask what you will receive, how often, and whether it covers attendance and homework completion rather than only marks.",
        ],
        bullets: [
          "Attendance — is the student actually turning up?",
          "Homework completion — is the work being done?",
          "Current strengths and weak areas, by topic",
          "One clear recommended next step",
        ],
      },
      {
        h2: "Check the commercial terms before you pay",
        body: [
          "Ask what the fee covers per month, what happens to missed classes, and what the refund or cancellation terms are. A provider confident in their teaching will have clear answers written down.",
        ],
      },
      {
        h2: "Credentials: what matters and what does not",
        body: [
          "Subject mastery and the ability to explain are what matter. A long list of qualifications in unrelated fields tells you very little about whether somebody can teach O Level Mathematics to a fifteen-year-old.",
          "Ask instead what they have taught, for how long, and to which syllabus.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I choose a tutor who teaches at my child's school?",
        a: "It can help with alignment, but be aware of the conflict of interest where a teacher tutors their own students privately. Ask your school what its policy is.",
      },
      {
        q: "How soon should I expect to see improvement?",
        a: "Be wary of anyone who promises a grade. What you can reasonably expect within a few weeks is better attendance, homework being completed, and your child being able to explain what they are stuck on more precisely.",
      },
    ],
    cta: {
      heading: "See how we answer these questions",
      body: "Syllabus codes, class caps, office hours, past-paper practice and the parent reports — all published on the programme page.",
      href: "/o-level",
      label: "View O Level programme",
    },
  },
  {
    slug: "how-much-should-o-level-student-study",
    h1: "How Much Should an O Level Student Study?",
    seoTitle: "How Many Hours Should an O Level Student Study?",
    description:
      "How much study an O Level student actually needs, why a weekly rhythm beats long sessions, and how the workload should change as the exam session approaches.",
    navLabel: "How much to study",
    intro:
      "Parents usually ask this as a question about hours. The honest answer is that hours are the wrong unit — a student who does forty minutes of focused past-paper work with the mark scheme open will get further than one who reads notes for three hours. The rhythm, and what the time is spent on, matter far more.",
    sections: [
      {
        h2: "A weekly rhythm beats a weekend marathon",
        body: [
          "Studying in a consistent weekly pattern works better than concentrating everything into long weekend sessions, for a simple reason: material reviewed a few days after it was taught is retained far better than material revisited once a fortnight.",
          "A workable rhythm for a single subject looks something like the following. The specific hours matter less than the fact that it repeats every week.",
        ],
        bullets: [
          "Attend the class and take notes by hand",
          "Within two days, redo one or two problems from the class without looking at the solution",
          "Complete the homework before it is due, rather than the night before the next class",
          "Bring anything still unclear to office hours rather than leaving it",
        ],
      },
      {
        h2: "The workload should change through the year",
        body: [
          "Early in the course the balance should sit with understanding concepts. As the exam session approaches it should shift toward timed past papers, because working at exam speed is a separate skill from knowing the content.",
          "Students who never practise under time pressure frequently understand the material and still underperform, because they have never had to produce it to a clock.",
        ],
      },
      {
        h2: "Signs the workload is wrong",
        body: [
          "Both too little and too much show up in recognisable ways.",
        ],
        bullets: [
          "Homework consistently done in the last hour before class — the volume may be fine, but the timing is not.",
          "Long study sessions with little to show for them — usually a sign of re-reading rather than practising.",
          "The same topic being asked about repeatedly over several weeks — the gap is not closing and needs direct attention.",
          "Fatigue, irritability or avoidance — worth taking seriously rather than pushing through.",
        ],
      },
      {
        h2: "How many subjects is too many",
        body: [
          "The number of subjects matters more than the hours per subject. Each additional subject brings its own homework, its own past papers and its own revision, and the total can become unmanageable quite suddenly.",
          "If a student is struggling across the board rather than in one subject, the problem is often the total load rather than any individual subject.",
        ],
      },
      {
        h2: "What we ask of students",
        body: [
          "Our own model is built around a weekly rhythm rather than volume — a live class each week per subject, homework with feedback, and open office hours Monday to Friday for anything that did not land. Parents receive regular reports on attendance and homework completion, which is usually the earliest signal that the workload needs adjusting.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should my child study every day?",
        a: "A short, consistent daily habit generally works better than long irregular sessions. What matters is that the work is active — solving problems, writing answers — rather than reading over notes.",
      },
      {
        q: "How do I know if my child is actually studying?",
        a: "Ask them to explain one thing they learned this week without looking at their notes. It is a far more reliable test than the number of hours the books were open.",
      },
      {
        q: "Is it better to study one subject at a time or rotate?",
        a: "Rotating between subjects across the week tends to help retention. Blocking an entire week on one subject leaves the others cold for too long.",
      },
    ],
    cta: {
      heading: "A structured weekly rhythm, built in",
      body: "Weekly live classes, homework with feedback, office hours between classes, and progress reports so you can see whether the rhythm is holding.",
      href: "/o-level",
      label: "View O Level programme",
    },
  },
  {
    slug: "when-to-start-o-level-preparation",
    h1: "When Should Students Start Preparing for O Levels?",
    seoTitle: "When to Start O Level Preparation | Timing Guide",
    description:
      "When to begin Cambridge O Level preparation, how the May/June and October/November exam sessions shape the timeline, and what starting late realistically costs.",
    navLabel: "When to start",
    intro:
      "The right starting point is set by the exam session your child is entered for, working backwards. Cambridge runs two main series a year — May/June and October/November — and almost every planning decision follows from which one you are aiming at.",
    sections: [
      {
        h2: "Work backwards from the exam session",
        body: [
          "A course taught properly needs enough time to cover the syllabus, and then a meaningful period for past papers and revision. Compressing that second part is what most often goes wrong.",
          "As a rough shape: allow the bulk of the year for teaching content, then a final phase dedicated to timed past papers, mark-scheme work and targeted revision of weak areas.",
        ],
      },
      {
        h2: "Starting early: what it buys you",
        body: [
          "Beginning well before the exam session is not about doing more work overall — it is about having room to absorb setbacks.",
        ],
        bullets: [
          "Time to fix foundational gaps before they compound. This matters most in Mathematics, where later topics depend directly on earlier ones.",
          "Room to fall ill, travel, or have a bad month without derailing the plan.",
          "Enough past papers to see patterns, rather than just completing a handful.",
          "Less pressure in the final term, which usually shows in the result.",
        ],
      },
      {
        h2: "Starting late: what it realistically costs",
        body: [
          "Starting a few months before the exam is not hopeless, but it forces choices. Something has to give, and it is usually either syllabus coverage or past-paper practice.",
          "If you are starting late, be honest with the tutor about the timeline at the outset so the plan reflects it. A programme designed for nine months and delivered in three tends to leave a student with partial coverage of everything rather than solid coverage of most things.",
        ],
      },
      {
        h2: "Our current cohort timeline",
        body: [
          "As a concrete example, our founding cohorts are structured around the May/June 2027 series.",
        ],
        bullets: [
          "Cohort starts — 12 September 2026",
          "Registration deadline — 10 September 2026",
          "Target exam session — May/June 2027",
          "Weekly live class per subject, plus office hours Monday to Friday",
        ],
      },
      {
        h2: "Signs it is time to start now",
        body: [
          "Regardless of the calendar, some signals suggest not waiting for the next natural starting point.",
        ],
        bullets: [
          "Marks slipping in a subject that used to be comfortable",
          "Your child avoiding a particular subject in conversation",
          "Homework taking dramatically longer than it used to",
          "A school report flagging a specific topic gap",
        ],
      },
    ],
    faqs: [
      {
        q: "When are Cambridge O Level exams held?",
        a: "Cambridge runs two main examination series each year, in May/June and in October/November. Your child's school will confirm which series they are entered for.",
      },
      {
        q: "Is one year enough to prepare for O Levels?",
        a: "For most students a full year taught consistently is workable, provided the final months are given to past papers and revision rather than still covering new content.",
      },
      {
        q: "Can my child join a cohort after it has started?",
        a: "Message us and we will tell you honestly whether joining late is workable for that subject, or whether waiting for the next cohort would serve your child better.",
      },
    ],
    cta: {
      heading: "See the current cohort dates",
      body: "Start date, registration deadline, weekly class times and the target exam session for each O Level subject.",
      href: "/o-level",
      label: "View O Level programme",
    },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
