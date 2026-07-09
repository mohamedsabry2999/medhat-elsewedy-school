// Branches store — Supabase-backed with realtime.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Branch = {
  id: string;
  name: string;
  address: string;
  usage: string;
  position: number;
};

const FALLBACK: Branch[] = [
  {
    id: "b-1",
    name: "فرع الحي الخامس عشر",
    address:
      "بجوار مدرسة أحمد زويل الثانوية بنات، الحي الخامس عشر، العاشر من رمضان، الشرقية، مصر.",
    usage: "استقبال أولياء الأمور والطلاب في الندوات التعريفية حسب المواعيد المعلنة.",
    position: 1,
  },
  {
    id: "b-2",
    name: "فرع المنطقة الصناعية",
    address: "قطعة رقم 68، المنطقة الصناعية 4A، مدينة العاشر من رمضان، مصر.",
    usage:
      "التدريب العملي والميداني داخل بيئة صناعية مرتبطة بالشريك الصناعي دار مدحت السويدي للطباعة.",
    position: 2,
  },
];

let cache: Branch[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

async function refetch() {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("position", { ascending: true });
  if (!error && data) {
    cache = data as Branch[];
    loaded = true;
    notify();
  }
}

let subscribed = false;
function ensureSubscribed() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  refetch();
  supabase
    .channel("branches-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "branches" }, () => refetch())
    .subscribe();
}

export function listBranches(): Branch[] {
  return loaded && cache.length > 0 ? cache : FALLBACK;
}

export function saveBranch(b: Branch) {
  supabase.from("branches").update({
    name: b.name, address: b.address, usage: b.usage, position: b.position,
  }).eq("id", b.id).then(({ error }) => {
    if (error) console.error("saveBranch", error);
  });
}

export function createBranch(b: Omit<Branch, "id">) {
  supabase.from("branches").insert(b).then(({ error }) => {
    if (error) console.error("createBranch", error);
  });
}

export function deleteBranch(id: string) {
  supabase.from("branches").delete().eq("id", id).then(({ error }) => {
    if (error) console.error("deleteBranch", error);
  });
}

export function useBranches(): Branch[] {
  const [list, setList] = useState<Branch[]>(() => listBranches());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listBranches());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}
