import { getKnowledgeContext, type KnowledgeContext } from "@/lib/knowledge";

export function buildContext(): KnowledgeContext {
  return getKnowledgeContext();
}

export const getAIKnowledgeContext = buildContext;

export const knowledgeProvider = {
  buildContext,
  getContext: buildContext
};
