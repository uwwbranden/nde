export function getModuleParameters(providers = []) {
  if (!Array.isArray(providers)) {
    return null;
  }

  const moduleParamsProvider = providers.find((provider) => provider?.provide === 'MODULE_PARAMETERS');
  return moduleParamsProvider?.useValue ?? null;
}

export async function loadFallbackSettings(importMetaUrl) {
  const settingsUrl = new URL('../settings.json', importMetaUrl);

  try {
    const response = await fetch(settingsUrl);
    if (!response.ok) {
      return {};
    }

    return await response.json();
  } catch {
    return {};
  }
}
