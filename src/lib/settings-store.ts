// Site-wide editable settings — Supabase-backed with realtime.
// Backward compatible with older callers that only used phone/email/branch1/branch2/socials.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  phone: string;
  email: string;
  // Deprecated per-branch fields kept for backward compatibility; real branches
  // now live in the "branches" store/table.
  branch1: string;
  branch2: string;
  facebook: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  footerDescription: string;
  mainCta: string;
  youtubeIntroUrl: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "01050360883",
  email: "school@elsewedyprint.com",
  branch1:
    "بجوار مدرسة أحمد زويل الثانوية بنات، الحي الخامس عشر، العاشر من رمضان، الشرقية، مصر.",
  branch2: "قطعة رقم 68، المنطقة الصناعية 4A، مدينة العاشر من رمضان، مصر.",
  facebook: "",
  instagram: "",
  youtube: "",
  whatsapp: "",
  footerDescription:
    "مدرسة مدحت السويدي للتكنولوجيا التطبيقية — تعليم فني متخصص في تكنولوجيا الطباعة، بالشراكة مع دار مدحت السويدي للطباعة وباعتماد الغرفة الألمانية AHK Cairo.",
  mainCta: "سجل الآن لحضور الندوة التعريفية",
  youtubeIntroUrl: "",
};

type DBRow = {
  id: number;
  phone: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  whatsapp_url: string;
  footer_description: string;
  main_cta: string;
};

function fromRow(r: DBRow): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    phone: r.phone || DEFAULT_SETTINGS.phone,
    email: r.email || DEFAULT_SETTINGS.email,
    facebook: r.facebook_url || "",
    instagram: r.instagram_url || "",
    youtube: r.youtube_url || "",
    whatsapp: r.whatsapp_url || "",
    footerDescription: r.footer_description || DEFAULT_SETTINGS.footerDescription,
    mainCta: r.main_cta || DEFAULT_SETTINGS.mainCta,
  };
}

let cache: SiteSettings = DEFAULT_SETTINGS;
let loaded = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

async function refetch() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (!error && data) {
    cache = fromRow(data as DBRow);
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
    .channel("settings-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => refetch())
    .subscribe();
}

export function readSettings(): SiteSettings {
  return loaded ? cache : DEFAULT_SETTINGS;
}

export function saveSettings(s: SiteSettings) {
  cache = s;
  notify();
  supabase.from("site_settings").update({
    phone: s.phone,
    email: s.email,
    facebook_url: s.facebook,
    instagram_url: s.instagram,
    youtube_url: s.youtube,
    whatsapp_url: s.whatsapp ?? "",
    footer_description: s.footerDescription ?? DEFAULT_SETTINGS.footerDescription,
    main_cta: s.mainCta ?? DEFAULT_SETTINGS.mainCta,
  }).eq("id", 1).then(({ error }) => {
    if (error) console.error("saveSettings", error);
  });
}

export function useSiteSettings(): SiteSettings {
  const [s, setS] = useState<SiteSettings>(readSettings());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setS(readSettings());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return s;
}
