// Site-wide editable settings backed by localStorage. Ready to swap for Supabase.
import { useEffect, useState } from "react";

export type SiteSettings = {
  phone: string;
  email: string;
  branch1: string;
  branch2: string;
  facebook: string;
  instagram: string;
  youtube: string;
};

const KEY = "meat_settings_v1";

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "01050360883",
  email: "school@elsewedyprint.com",
  branch1:
    "بجوار مدرسة أحمد زويل الثانوية بنات، الحي الخامس عشر، العاشر من رمضان، الشرقية، مصر.",
  branch2: "قطعة رقم 68، المنطقة الصناعية 4A، مدينة العاشر من رمضان، مصر.",
  facebook: "",
  instagram: "",
  youtube: "",
};

export function readSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: SiteSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("meat:settings-changed"));
}

export function useSiteSettings(): SiteSettings {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setS(readSettings());
    const on = () => setS(readSettings());
    window.addEventListener("meat:settings-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("meat:settings-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return s;
}
