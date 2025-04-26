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
import type * as attendees from "../attendees.js";
import type * as cart from "../cart.js";
import type * as emails from "../emails.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as merchandise from "../merchandise.js";
import type * as registrations from "../registrations.js";
import type * as subscriptions from "../subscriptions.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendees: typeof attendees;
  cart: typeof cart;
  emails: typeof emails;
  events: typeof events;
  http: typeof http;
  merchandise: typeof merchandise;
  registrations: typeof registrations;
  subscriptions: typeof subscriptions;
  ticketTypes: typeof ticketTypes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
