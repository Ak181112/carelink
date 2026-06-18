import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ApplicationState {
  // Step 1: About You
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    dob: string;
    gender: string;
    address: string;
    bio: string;
    profileImage: string | null;
  };
  // Step 2: Verification
  verification: {
    nicFrontName: string | null;
    policeClearanceName: string | null;
  };
  // Step 3: Skills & Languages
  skills: string[];
  languages: string[];
  // Step 4: Service Area & Rate
  hourlyRate: number;
  serviceArea: string[];

  // State Hydration Actions
  setPersonalInfo: (data: Partial<ApplicationState["personalInfo"]>) => void;
  setVerification: (data: Partial<ApplicationState["verification"]>) => void;
  setSkills: (skills: string[]) => void;
  setLanguages: (languages: string[]) => void;
  setServiceDetails: (rate: number, areas: string[]) => void;
  resetForm: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      personalInfo: {
        fullName: "Chamathka Perera", // Preserving structural defaults matching screen_3.png
        email: "chamathka.p@example.com",
        phone: "+94 77 123 4567",
        location: "Kurunegala Central",
        dob: "",
        gender: "",
        address: "",
        bio: "",
        profileImage: null,
      },
      verification: {
        nicFrontName: "NIC_Front.jpg",
        policeClearanceName: "Police_Clearance.pdf",
      },
      skills: ["Elderly Care", "Medication Management", "Wound Dressing", "Dementia Support"],
      languages: ["Sinhala", "English"],
      hourlyRate: 1500,
      serviceArea: ["Colombo", "Kurunegala", "Wattala"],

      setPersonalInfo: (data) =>
        set((state) => ({ personalInfo: { ...state.personalInfo, ...data } })),
      setVerification: (data) =>
        set((state) => ({ verification: { ...state.verification, ...data } })),
      setSkills: (skills) => set({ skills }),
      setLanguages: (languages) => set({ languages }),
      setServiceDetails: (hourlyRate, serviceArea) => set({ hourlyRate, serviceArea }),
      resetForm: () =>
        set({
          personalInfo: { fullName: "", email: "", phone: "", location: "", dob: "", gender: "", address: "", bio: "", profileImage: null },
          verification: { nicFrontName: null, policeClearanceName: null },
          skills: [],
          languages: [],
          hourlyRate: 0,
          serviceArea: [],
        }),
    }),
    {
      name: "carelink-application-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);