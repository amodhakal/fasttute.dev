/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as retrieveVideoInfo from "../retrieveVideoInfo.js";
import type * as schema_videoChat from "../schema/videoChat.js";
import type * as schema_videoInfo from "../schema/videoInfo.js";
import type * as videoChat from "../videoChat.js";
import type * as videoInfo from "../videoInfo.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  retrieveVideoInfo: typeof retrieveVideoInfo;
  "schema/videoChat": typeof schema_videoChat;
  "schema/videoInfo": typeof schema_videoInfo;
  videoChat: typeof videoChat;
  videoInfo: typeof videoInfo;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
