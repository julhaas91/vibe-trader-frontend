export function getApiKey(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:apiKey") ?? null;
  } catch {
    // no-op
  }

  return null;
}

export function getOrganizationId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:organizationId") ?? null;
  } catch {
    // no-op
  }

  return null;
}

export function getTenantId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:tenantId") ?? null;
  } catch {
    // no-op
  }

  return null;
}

export function getAssistantId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:assistantId") ?? null;
  } catch {
    // no-op
  }

  return null;
}

export function getDeploymentUrl(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:deploymentUrl") ?? null;
  } catch {
    // no-op
  }

  return null;
}
