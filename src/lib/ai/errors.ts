export type AIErrorCode =
  | "MODEL_NOT_FOUND"
  | "MODEL_DISABLED"
  | "INVALID_REQUEST"
  | "INVALID_RESPONSE"
  | "PROVIDER_NOT_CONNECTED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAUTHORIZED"
  | "PROVIDER_RATE_LIMIT"
  | "PROVIDER_ERROR"
  | "GENERATION_FAILED";

export class AIError extends Error {
  constructor(message: string, public readonly code: AIErrorCode, public readonly cause?: unknown) {
    super(message);
    this.name = "AIError";
  }
}

export class AIModelError extends AIError {
  constructor(message: string, code: "MODEL_NOT_FOUND" | "MODEL_DISABLED") {
    super(message, code);
    this.name = "AIModelError";
  }
}

export class AIValidationError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, "INVALID_REQUEST", cause);
    this.name = "AIValidationError";
  }
}

export class AIResponseParseError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, "INVALID_RESPONSE", cause);
    this.name = "AIResponseParseError";
  }
}

export class AIProviderNotConnectedError extends AIError {
  constructor() {
    super("El proveedor de IA no está configurado.", "PROVIDER_NOT_CONNECTED");
    this.name = "AIProviderNotConnectedError";
  }
}

export class AIProviderError extends AIError {
  constructor(
    message: string,
    code: "PROVIDER_TIMEOUT" | "PROVIDER_UNAUTHORIZED" | "PROVIDER_RATE_LIMIT" | "PROVIDER_ERROR",
    public readonly retryable: boolean,
    public readonly statusCode?: number,
    cause?: unknown
  ) {
    super(message, code, cause);
    this.name = "AIProviderError";
  }
}

export function normalizeAIError(error: unknown): AIError {
  return error instanceof AIError ? error : new AIError(error instanceof Error ? error.message : "La generación falló.", "GENERATION_FAILED", error);
}
