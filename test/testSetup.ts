// Polyfill Deno.env.get for modules expecting Deno runtime
(global as any).Deno = { env: { get: (key: string) => process.env[key] } };
export {};
