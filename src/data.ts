import { Channel, Category, Profile, Subscription } from "./types";

export const profile: Profile[] = [
  {
    id: "c239b4e5-8cd5-480e-8491-d09bfb251b12",
    name: "Away",
    readOnly: true,
    current: true
  },
  {
    id: "5e0a27c6-f12d-4fb3-8447-f97465e10e03",
    name: "Online",
    readOnly: true,
    current: false
  },
  {
    id: "a0b658f5-b0e7-4185-bc36-4c54cc083b6f",
    name: "Out of Office",
    readOnly: true,
    current: false
  },
  {
    id: "a7828b0b-041f-497f-9399-59ed7f6ce057",
    name: "Oscar",
    readOnly: false,
    current: false
  }
];

export const channels: Channel[] = [
  {
    id: "channel-501a28ab-0368-4988-8881-04fd8c733eae",
    name: "Web Push"
  },
  {
    id: "channel-e381b23b-6019-4da9-a9ae-0caa3d4c1eae",
    name: "VAKT Platform"
  }
];

export const categories: Category[] = [
  {
    id: "category-f955d028-7ff0-4851-b0d1-b34e2f2e9321",
    name: "BFOET Trades",
    events: [
      {
        id: "event-6233769e-cfc3-42e3-8ef1-6514d6ce3e1c",
        name: "Cancelled",
        tag: "TRADE_CANCEL",
        permissionAction: "TRADE_VIEW"
      },
      {
        id: "event-v2-6233769e-cfc3-42e3-8ef1-6514d6ce3",
        name: "Cancelled V2",
        tag: "TRADE_CANCEL",
        permissionAction: "TRADE_VIEW"
      }
    ]
  },
  {
    id: "8f862068-a4ec-40df-b61a-c27fa353281f",
    name: "BFOET Logistics (Time Sensitive)",
    events: [
      {
        id: "event-5ca68760-2c44-4618-9a46-4c5266cc59a5",
        name: "Option Rejected ",
        tag: "OPTION_REJECT",
        permissionAction: "LOGISTICS_R"
      }
    ]
  }
];

export const subscriptions: Subscription[] = [
  {
    id: "subscription-69039cdd-1e8f-4210-9a6e-a828c14b2aed",
    profileId: null,
    event: {
      id: "event-6233769e-cfc3-42e3-8ef1-6514d6ce3e1c",
      name: "Cancelled"
    },
    channel: {
      id: "channel-501a28ab-0368-4988-8881-04fd8c733eae",
      name: "Web Push"
    }
  },
  {
    id: "subscription-e314588d-b0c8-4cf3-8af0-e12bf1fb442f",
    profileId: null,
    event: {
      id: "event-6233769e-cfc3-42e3-8ef1-6514d6ce3e1c",
      name: "Cancelled"
    },
    channel: {
      id: "channel-e381b23b-6019-4da9-a9ae-0caa3d4c1eae",
      name: "VAKT Platform"
    }
  }
];
