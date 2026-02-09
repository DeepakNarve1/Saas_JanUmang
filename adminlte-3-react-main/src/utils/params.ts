/**
 * Utility to handle Next.js params that can be either a Promise or a regular object
 * This handles compatibility between different Next.js versions
 */

import { use } from "react";

/**
 * Resolves params whether they are a Promise or a regular object
 * @param params - The params object from Next.js page props
 * @returns The resolved params object
 */
export function resolveParams<T>(params: Promise<T> | T): T {
  if (params instanceof Promise) {
    return use(params);
  }
  return params;
}

/**
 * Type helper for page props with dynamic params
 */
export type PageProps<T = { id: string }> = {
  params: Promise<T> | T;
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
};
