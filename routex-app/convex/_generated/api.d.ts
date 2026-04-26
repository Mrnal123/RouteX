/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_eta from "../ai/eta.js";
import type * as ai_explain from "../ai/explain.js";
import type * as dashboard from "../dashboard.js";
import type * as decisionLogs from "../decisionLogs.js";
import type * as disruptions from "../disruptions.js";
import type * as etaPredict from "../etaPredict.js";
import type * as orders from "../orders.js";
import type * as reroutePredict from "../reroutePredict.js";
import type * as routes from "../routes.js";
import type * as routing_astar from "../routing/astar.js";
import type * as routing_graph from "../routing/graph.js";
import type * as routing_heuristics from "../routing/heuristics.js";
import type * as routing_replan from "../routing/replan.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/eta": typeof ai_eta;
  "ai/explain": typeof ai_explain;
  dashboard: typeof dashboard;
  decisionLogs: typeof decisionLogs;
  disruptions: typeof disruptions;
  etaPredict: typeof etaPredict;
  orders: typeof orders;
  reroutePredict: typeof reroutePredict;
  routes: typeof routes;
  "routing/astar": typeof routing_astar;
  "routing/graph": typeof routing_graph;
  "routing/heuristics": typeof routing_heuristics;
  "routing/replan": typeof routing_replan;
  vehicles: typeof vehicles;
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
