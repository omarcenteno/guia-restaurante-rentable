import type { Organization, Workspace } from "./types";

const createdAt = "2026-07-17T00:00:00.000Z";

export const defaultOrganization: Organization = {
  id: "omar",
  name: "Omar",
  owner: "Omar",
  createdAt,
  updatedAt: createdAt,
  workspaceIds: ["grr", "aoki-grill"]
};

export const defaultWorkspaces: Workspace[] = [
  {
    id: "grr",
    name: "Guía Restaurante Rentable",
    slug: "guia-restaurante-rentable",
    description: "Content OS para abrir, operar y crecer restaurantes rentables en Estados Unidos.",
    logo: "",
    cover: "",
    createdAt,
    updatedAt: createdAt,
    theme: {
      primaryColor: "#0E1B2B",
      accentColor: "#C7A45A",
      backgroundColor: "#F7F3EA",
      textColor: "#1F2937",
      fontFamily: "inherit"
    },
    settings: {
      language: "es",
      timezone: "America/New_York",
      currency: "USD",
      defaultPlatform: "Instagram",
      contentNamespace: "grr"
    },
    permissions: {
      ownerId: "omar",
      canEditBrand: true,
      canEditContent: true,
      canGenerateAI: true,
      canManageAssets: true,
      canViewAnalytics: true
    },
    metadata: {
      industry: "Restaurantes",
      country: "United States",
      currentPhase: "Content OS",
      migratedFromLegacy: true,
      dataVersion: 1
    }
  },
  {
    id: "aoki-grill",
    name: "Aoki Grill",
    slug: "aoki-grill",
    description: "Workspace preparado para una marca de restaurante independiente.",
    logo: "",
    cover: "",
    createdAt,
    updatedAt: createdAt,
    theme: {
      primaryColor: "#0E1B2B",
      accentColor: "#C7A45A",
      backgroundColor: "#F7F3EA",
      textColor: "#1F2937",
      fontFamily: "inherit"
    },
    settings: {
      language: "es",
      timezone: "America/New_York",
      currency: "USD",
      defaultPlatform: "Instagram",
      contentNamespace: "aoki-grill"
    },
    permissions: {
      ownerId: "omar",
      canEditBrand: true,
      canEditContent: true,
      canGenerateAI: true,
      canManageAssets: true,
      canViewAnalytics: true
    },
    metadata: {
      industry: "Restaurantes",
      country: "United States",
      currentPhase: "Workspace",
      migratedFromLegacy: false,
      dataVersion: 1
    }
  }
];

export const defaultWorkspace = defaultWorkspaces[0];
