// Fixed weekly Zoom schedule for "Private Candidates" — students sitting
// their Matric board exam privately rather than through a regular school.
// A separate, smaller set of review classes from the main per-subject
// live-sessions system (punjab9thSessions.ts / punjab10thSessions.ts),
// which is why it's its own static list rather than another row type in
// that admin-managed table: these are permanent, reused-every-week Zoom
// rooms (same link every Monday, etc.), not one-off scheduled sessions.

export interface PrivateClassSlot {
  subject: string;
  day: string;
  time: string;
  zoomUrl: string;
}

export const PRIVATE_CLASS_SCHEDULE_9TH: PrivateClassSlot[] = [
  { subject: "Math", day: "Monday", time: "11:00 AM", zoomUrl: "https://us06web.zoom.us/j/85754287709?pwd=OJdadUnhyykftu1SoHCx1A9XuqWqw4.1" },
  { subject: "General Science", day: "Tuesday", time: "11:00 AM", zoomUrl: "https://us06web.zoom.us/j/82052287855?pwd=Ds7gOLyh2dej2KCtVbv7CLSIonvvJ7.1" },
  { subject: "Urdu", day: "Wednesday", time: "11:00 AM", zoomUrl: "https://us06web.zoom.us/j/87566836685?pwd=mkdWLuXE2COwg1A4qmXlVJCEPelhDb.1" },
  { subject: "Test and Review", day: "Thursday", time: "11:00 AM", zoomUrl: "https://us06web.zoom.us/j/89055101644?pwd=NYXEa0FFfGb6wYpdsPf6bUNTqp8ned.1" },
  { subject: "English", day: "Friday", time: "10:00 AM", zoomUrl: "https://us06web.zoom.us/j/83715835980?pwd=6Sb5fBbXSWCSnQba60Pi9G6pSxnr0I.1" },
];

export const PRIVATE_CLASS_SCHEDULE_10TH: PrivateClassSlot[] = [
  { subject: "Math", day: "Monday", time: "12:00 PM", zoomUrl: "https://us06web.zoom.us/j/84525599489?pwd=lqPxBq9noajH61RLr2wbxD0KQTO5fL.1" },
  { subject: "General Science", day: "Tuesday", time: "12:00 PM", zoomUrl: "https://us06web.zoom.us/j/87060106533?pwd=2FL5bTHC0xNnt6Z9V3BhjyN4sd6yVV.1" },
  { subject: "Urdu", day: "Wednesday", time: "12:00 PM", zoomUrl: "https://us06web.zoom.us/j/85052831979?pwd=je5lV2ONxOONyEDCfYB5oGaCbSAeDk.1" },
  { subject: "Test and Review", day: "Thursday", time: "12:00 PM", zoomUrl: "https://us06web.zoom.us/j/89504346455?pwd=KxEnDvC9IrXBW7URL79k2iUBIV9RBc.1" },
  { subject: "English", day: "Friday", time: "11:00 AM", zoomUrl: "https://us06web.zoom.us/j/85627589979?pwd=CBanb7KOa6zqZLPnmmO7HaGyHgPpwe.1" },
];
