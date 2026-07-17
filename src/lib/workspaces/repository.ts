import type { Organization, Workspace } from "./types";
import { defaultOrganization, defaultWorkspace, defaultWorkspaces } from "./workspaceDefaults";

const WORKSPACES_KEY = "grr-workspaces";
const ORGANIZATION_KEY = "grr-organization";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadOrganization(): Organization {
  if (typeof window === "undefined") return defaultOrganization;
  return safeParse(window.localStorage.getItem(ORGANIZATION_KEY), defaultOrganization);
}

export function saveOrganization(organization: Organization): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORGANIZATION_KEY, JSON.stringify(organization));
}

export function loadWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return defaultWorkspaces;
  const stored = safeParse<Workspace[]>(window.localStorage.getItem(WORKSPACES_KEY), defaultWorkspaces);
  return stored.some((workspace) => workspace.id === defaultWorkspace.id) ? stored : [defaultWorkspace, ...stored];
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
}
