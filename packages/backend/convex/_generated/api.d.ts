/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as feedback from "../feedback.js";
import type * as retrieveVideoInfo from "../retrieveVideoInfo.js";
import type * as schema_feedback from "../schema/feedback.js";
import type * as schema_videoChat from "../schema/videoChat.js";
import type * as schema_videoInfo from "../schema/videoInfo.js";
import type * as videoChat from "../videoChat.js";
import type * as videoInfo from "../videoInfo.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  feedback: typeof feedback;
  retrieveVideoInfo: typeof retrieveVideoInfo;
  "schema/feedback": typeof schema_feedback;
  "schema/videoChat": typeof schema_videoChat;
  "schema/videoInfo": typeof schema_videoInfo;
  videoChat: typeof videoChat;
  videoInfo: typeof videoInfo;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
