"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PatientProfile, DietaryRestriction, NutritionalTarget } from "@/lib/types";

interface ProfileStore {
  profile: PatientProfile | null;
  _hasHydrated: boolean;
  setProfile: (profile: PatientProfile) => void;
  updateTargets: (targets: NutritionalTarget[]) => void;
  updateRestrictions: (restrictions: DietaryRestriction[]) => void;
  resetProfile: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setProfile: (profile) => set({ profile }),
      updateTargets: (targets) =>
        set((state) =>
          state.profile ? { profile: { ...state.profile, targets } } : {}
        ),
      updateRestrictions: (restrictions) =>
        set((state) =>
          state.profile ? { profile: { ...state.profile, restrictions } } : {}
        ),
      resetProfile: () => set({ profile: null }),
    }),
    {
      name: "meal-builder-profile",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
