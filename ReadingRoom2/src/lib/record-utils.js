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
  if (firstValue != null) {
    return firstValue;
  }

  return findRecordLikeObject(hostComponent) ?? hostComponent;
}

export function findRecordLikeObject(root) {
  if (!root || typeof root !== 'object') {
    return null;
  }

  const visited = new Set();
  const queue = [{ value: root, depth: 0 }];
  const maxDepth = 3;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const { value, depth } = current;
    if (!value || typeof value !== 'object' || visited.has(value)) {
      continue;
    }
    visited.add(value);

    if (value?.pnx?.display || value?.delivery?.bestlocation) {
      return value;
    }

    if (depth >= maxDepth) {
      continue;
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === 'object' && !isObservableLike(child)) {
        queue.push({ value: child, depth: depth + 1 });
      }
    }
  }

  return null;
}
