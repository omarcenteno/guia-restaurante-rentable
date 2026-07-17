export interface Organization {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  workspaceIds: string[];
}

export interface WorkspaceTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface WorkspaceSettings {
  language: "es" | "en";
  timezone: string;
  currency: string;
  defaultPlatform: string;
  contentNamespace: string;
}

export interface WorkspacePermissions {
  ownerId: string;
  canEditBrand: boolean;
  canEditContent: boolean;
  canGenerateAI: boolean;
  canManageAssets: boolean;
  canViewAnalytics: boolean;
}

export interface WorkspaceMetadata {
  industry: string;
  country: string;
  currentPhase: string;
  migratedFromLegacy: boolean;
  dataVersion: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  cover: string;
  createdAt: string;
  updatedAt: string;
  theme: WorkspaceTheme;
  settings: WorkspaceSettings;
  permissions: WorkspacePermissions;
  metadata: WorkspaceMetadata;
}

export interface WorkspaceContextValue {
  organization: Organization;
  workspaces: Workspace[];
  workspace: Workspace;
  setActiveWorkspace: (workspaceId: string) => void;
}
