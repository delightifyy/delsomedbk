import { useEffect, useState, useCallback } from "react";

export type PatientCategory = "card" | "hmo" | "subscription" | "organization";

export const PATIENT_CATEGORY_OPTIONS: { value: PatientCategory; label: string }[] = [
  { value: "card", label: "Card Payment" },
  { value: "hmo", label: "\u200BCard" },
  { value: "subscription", label: "Subscription" },
  { value: "organization", label: "Organization" },
];

const STORAGE_KEY = "desolmed.patient.category";
const EVENT = "desolmed:patient-category-changed";

const read = (): PatientCategory => {
  if (typeof window === "undefined") return "card";
  const v = window.localStorage.getItem(STORAGE_KEY) as PatientCategory | null;
  return v && PATIENT_CATEGORY_OPTIONS.some((o) => o.value === v) ? v : "card";
};

export const usePatientCategory = (): [PatientCategory, (c: PatientCategory) => void] => {
  const [category, setCategoryState] = useState<PatientCategory>(read);

  useEffect(() => {
    const onChange = () => setCategoryState(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setCategory = useCallback((c: PatientCategory) => {
    window.localStorage.setItem(STORAGE_KEY, c);
    window.dispatchEvent(new Event(EVENT));
    setCategoryState(c);
  }, []);

  return [category, setCategory];
};

export const categoryLabel = (c: PatientCategory) =>
  PATIENT_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;
