export function isObservableLike(value) {
  return !!value && typeof value.subscribe === 'function';
}

export function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return fallback;
}

export function getRecordSource(hostComponent) {
  if (!hostComponent) {
    return null;
  }

  const candidates = [
    hostComponent.record$,
    hostComponent.record,
    hostComponent.item$,
    hostComponent.item,
    hostComponent.location$,
    hostComponent.location,
    hostComponent.locations$,
    hostComponent.locations,
    hostComponent.source?.record$,
    hostComponent.source?.record,
    hostComponent.parentCtrl?.record$,
    hostComponent.parentCtrl?.record,
    hostComponent.parentCtrl?.item$,
    hostComponent.parentCtrl?.item
  ];

  const observableCandidate = candidates.find((value) => isObservableLike(value));
  if (observableCandidate) {
    return observableCandidate;
  }

  const firstValue = candidates.find((value) => value != null);
  return firstValue ?? hostComponent;
}

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const content = trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1) : trimmed;

    return content
      .split(',')
      .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [];
}

export function collectPrimitivePaths(root, options = {}) {
  const maxDepth = options.maxDepth ?? 5;
  const includeKey = options.includeKey ?? (() => true);
  const visited = new Set();
  const results = [];
  const queue = [{ value: root, path: options.rootPath ?? 'root', depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const { value, path, depth } = current;

    if (value == null) {
      continue;
    }

    if (typeof value !== 'object') {
      const key = path.split('.').pop() ?? path;
      if (includeKey(key, path, value)) {
        results.push({ path, value });
      }
      continue;
    }

    if (visited.has(value) || depth >= maxDepth || isObservableLike(value)) {
      continue;
    }

    visited.add(value);

    for (const [key, child] of Object.entries(value)) {
      queue.push({
        value: child,
        path: `${path}.${key}`,
        depth: depth + 1
      });
    }
  }

  return results;
}
