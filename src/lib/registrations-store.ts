// Local in-memory + localStorage store for visit registrations.
// Structured to be swapped later for Supabase.

export type RegistrationStatus = "جديد" | "تم التواصل" | "مؤكد" | "حضر" | "لم يحضر";

export type Registration = {
  id: string;
  studentName: string;
  nationalId: string;
  guardianPhone: string;
  whatsapp: string;
  governorate: string;
  eduDept: string;
  score: string;
  attendees: number;
  visitDate: string;
  notes: string;
  status: RegistrationStatus;
  createdAt: string;
};

const KEY = "meat_registrations_v1";

const SEED: Registration[] = [
  {
    id: "r-1001",
    studentName: "أحمد محمد علي",
    nationalId: "30201010101010",
    guardianPhone: "01000000001",
    whatsapp: "01000000001",
    governorate: "القاهرة",
    eduDept: "إدارة شرق",
    score: "260",
    attendees: 2,
    visitDate: "2026-07-20",
    notes: "",
    status: "جديد",
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "r-1002",
    studentName: "منى إبراهيم",
    nationalId: "30202020202020",
    guardianPhone: "01000000002",
    whatsapp: "01000000002",
    governorate: "الجيزة",
    eduDept: "إدارة العجوزة",
    score: "245",
    attendees: 3,
    visitDate: "2026-07-20",
    notes: "الحضور مع الوالدين",
    status: "مؤكد",
    createdAt: "2026-07-02T10:30:00Z",
  },
  {
    id: "r-1003",
    studentName: "محمود سعيد",
    nationalId: "30203030303030",
    guardianPhone: "01000000003",
    whatsapp: "01000000003",
    governorate: "القليوبية",
    eduDept: "إدارة بنها",
    score: "210",
    attendees: 1,
    visitDate: "2026-07-27",
    notes: "",
    status: "تم التواصل",
    createdAt: "2026-07-03T11:15:00Z",
  },
];

function read(): Registration[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Registration[];
  } catch {
    return SEED;
  }
}

function write(list: Registration[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function listRegistrations(): Registration[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addRegistration(
  data: Omit<Registration, "id" | "status" | "createdAt">,
): Registration {
  const rec: Registration = {
    ...data,
    id: `r-${Date.now()}`,
    status: "جديد",
    createdAt: new Date().toISOString(),
  };
  const list = read();
  list.push(rec);
  write(list);
  return rec;
}

export function updateStatus(id: string, status: RegistrationStatus) {
  const list = read().map((r) => (r.id === id ? { ...r, status } : r));
  write(list);
}
