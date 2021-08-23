export interface Channel {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  tag: string;
  permissionAction: string;
}

export interface Category {
  id: string;
  name: string;
  events: Event[];
}

export interface Profile {
  id: string;
  name: string;
  readOnly: boolean;
  current: boolean;
}

// ============================================================
// These are the "new types" created for the solution:
// ============================================================
export enum EventCheckedEnum {
  UNCHECKED,
  CHECKED,
  UNSOLVED
}

export interface Subscription {
  id: string;
  profileId: string | null;
  event: Pick<Event, "id" | "name">;
  channel: Pick<Category, "id" | "name">;
}

export interface CategoryEvent {
  event: Event;
  category: Category;
}

export interface SubscriptionOption {
  event?: Event;
  category?: Pick<Category, "id" | "name">;
  channel?: Channel;
  key: string;
  checked: EventCheckedEnum;
  type: "event" | "category" | "channel";
}
