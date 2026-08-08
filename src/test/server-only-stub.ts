/**
 * Stands in for the `server-only` package under Vitest.
 *
 * That package exists to make a build fail if a server module is pulled into a
 * client bundle. In a Node test runner there is no bundle and no boundary to
 * protect, so importing the real one would throw for no reason.
 */
export {};
