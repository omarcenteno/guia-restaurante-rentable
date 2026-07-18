"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { migrateWorkspaceData } from "./migration";
import { loadOrganization, loadWorkspaces, saveOrganization, saveWorkspaces } from "./repository";
import { loadActiveWorkspaceId, saveActiveWorkspaceId } from "./storage";
import type { WorkspaceContextValue } from "./types";
import { defaultOrganization, defaultWorkspace, defaultWorkspaces } from "./workspaceDefaults";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState(defaultOrganization);
  const [workspaces, setWorkspaces] = useState(defaultWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(defaultWorkspace.id);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedWorkspaces = loadWorkspaces();
    const storedOrganization = loadOrganization();
    const storedActiveId = loadActiveWorkspaceId();
    migrateWorkspaceData(storedActiveId);
    setWorkspaces(storedWorkspaces);
    setOrganization(storedOrganization);
    setActiveWorkspaceId(storedWorkspaces.some((workspace) => workspace.id === storedActiveId) ? storedActiveId : defaultWorkspace.id);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    migrateWorkspaceData(activeWorkspaceId);
    saveWorkspaces(workspaces);
    saveOrganization(organization);
    saveActiveWorkspaceId(activeWorkspaceId);
  }, [activeWorkspaceId, hydrated, organization, workspaces]);

  const workspace = workspaces.find((item) => item.id === activeWorkspaceId) ?? defaultWorkspace;

  const value = useMemo<WorkspaceContextValue>(() => ({
    organization,
    workspaces,
    workspace,
    setActiveWorkspace: setActiveWorkspaceId
  }), [organization, workspace, workspaces]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace debe usarse dentro de WorkspaceProvider.");
  return context;
}
