// Static container entry that exposes the module names the NDE loader requests.
const moduleMap = {
  './custom-module': () => import(new URL('./src/bootstrap.js', import.meta.url).href),
  './HidePeriodicalItems': () => import(new URL('./src/bootstrap.js', import.meta.url).href)
};

export async function get(request) {
  const loader = moduleMap[request];
  if (!loader) {
    throw new Error(`Module "${request}" does not exist in container.`);
  }

  const module = await loader();
  return () => module;
}

export async function init() {
  return undefined;
}
