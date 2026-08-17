"use client";

import { useSyncExternalStore } from "react";

/** Nothing ever changes after mount, so the subscription is a no-op. */
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and through the hydrating render, true
 * from then on.
 *
 * Anything read from the local clock, `localStorage` or `matchMedia` is
 * different in the render the server produced and the render the browser would
 * produce — a date stamp is simply wrong for anyone outside the deploy
 * region's timezone. Gating that content on this hook keeps the two renders
 * identical and fills the value in immediately afterwards.
 *
 * `useSyncExternalStore` rather than a mount effect: it hands React both
 * snapshots up front instead of rendering once and then correcting state.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
