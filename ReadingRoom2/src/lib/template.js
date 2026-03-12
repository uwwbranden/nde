function getValueByPath(source, path) {
  return path.split('.').reduce((value, key) => {
    if (value == null) {
      return '';
    }
    return value[key];
  }, source);
}

export function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
    const value = getValueByPath(data, path);
    return value == null ? '' : String(value);
  });
}
