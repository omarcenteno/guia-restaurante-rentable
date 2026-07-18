import type { Workspace } from "./types";
import { defaultWorkspace } from "./workspaceDefaults";

export const workspaceRepository = {
  list(workspaceId: string, workspaces: Workspace[]): Workspace[] {
    return workspaces.filter((workspace) => workspace.id === workspaceId);
  },
  get(workspaceId: string, workspaces: Workspace[]): Workspace {
    return workspaces.find((workspace) => workspace.id === workspaceId) ?? defaultWorkspace;
  },
  save(workspaceId: string, workspaces: Workspace[], next: Workspace): Workspace[] {
    const exists = workspaces.some((workspace) => workspace.id === workspaceId);
    return exists ? workspaces.map((workspace) => workspace.id === workspaceId ? next : workspace) : [...workspaces, next];
  },
  delete(workspaceId: string, workspaces: Workspace[]): Workspace[] {
    return workspaces.filter((workspace) => workspace.id !== workspaceId);
  },
  search(workspaceId: string, workspaces: Workspace[], query: string): Workspace[] {
    const normalized = query.toLocaleLowerCase("es").trim();
    return workspaces.filter((workspace) => workspace.id === workspaceId || [workspace.name, workspace.slug, workspace.description].join(" ").toLocaleLowerCase("es").includes(normalized));
  }
};
