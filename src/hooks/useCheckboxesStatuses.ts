import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SubscriptionOption,
  CategoryEvent,
  Category,
  Channel,
  EventCheckedEnum,
  Subscription
} from "../types";
import checkParentNextStatus from "./checkParentNextStatus";

/**
 * Check if a SubscriptionOption already have a Subscription comming from the API.
 * Wich means this option/event should start itself as a "checked" checkbox
 */
function checkPreExistentSubscription(
  info: SubscriptionOption,
  channel: Channel,
  subscriptions: Subscription[]
): Subscription | undefined {
  return subscriptions.find(
    (s) => s.event.id === info.event?.id && s.channel.id === channel.id
  );
}

//
/**
 * This method "prepares" the data that comes from the API (like a list of Categories and Channels)
 * and convert them into an object that reflects the real Events to be choosen.
 * The object uses a combination of the "channel.id + event.id" as the "key".
 * This is necessary because the same Event must be available/reltated in all Channels.
 *
 * So, if there are two events like:
 *    { id: "a", name: "Event A" }
 *    { id: "b", name: "Event B" }
 *
 * And two Channels like:
 *    { id: "x", name: "Channel X" }
 *    { id: "y", name: "Channel Y" }
 *
 * The result of this method will be an object like:
 * {
 *    x__a: { ... },
 *    x__b: { ... },
 *    y__a: { ... },
 *    y__b: { ... },
 * }
 *
 * The "ids" are concatenated with "double underscore" (__). But only to make it easier to debug.
 *
 * As you can see above, the "Channel X" is connected to events "a" and "b" and the same happens to
 * "channel y".
 *
 * @param categories A list of the categories that comes from the API
 * @param channels A list of the channels that comes from the API
 *
 * @returns Record<string, SubscriptionOption> the object with the avaialable EVENTS to be choosen/clicked in the UI
 */
function prepareSubscriptionOptions(
  categories: Category[],
  channels: Channel[],
  subscriptions: Subscription[]
) {
  // extract all events to a flat list:
  const eventsCategoryInfo: Record<string, CategoryEvent> = categories.reduce(
    (acc, category) => {
      let temp = {
        ...acc
      };

      temp = category.events.reduce<Record<string, CategoryEvent>>(
        (eventsAcc, event) => {
          return {
            ...eventsAcc,
            [event.id]: {
              event,
              category
            }
          };
        },
        temp
      );

      return temp;
    },
    {}
  );

  // Now, for each CategoryEvent bind, is necessary to bind it to each channel.
  // This "bind" will produce a relationship between Event / Channel / Category: the SubscriptionOption objet
  const subscriptionOptions = Object.values(eventsCategoryInfo).reduce<
    SubscriptionOption[]
  >((acc, info) => {
    const result = [...acc];
    channels.forEach((channel: Channel) => {
      const subscriptionOption: SubscriptionOption = {
        event: info.event,
        channel,
        key: `${channel.id}__${info.event.id}`,
        checked: 0,
        category: info.category,
        type: "event"
      };
      // check for existent subscription from API:
      subscriptionOption.checked = checkPreExistentSubscription(
        subscriptionOption,
        channel,
        subscriptions
      )
        ? 1
        : 0;

      result.push(subscriptionOption);
      return result;
    });
    return result;
  }, []);

  return subscriptionOptions;
}

/**
 * This method calculates the next checked status for an Event
 * @param status EventCheckedEnum
 *
 * @returns EventCheckedEnum: the next status value
 */
function resolveNextChecked(status: EventCheckedEnum): EventCheckedEnum {
  if (status === EventCheckedEnum.CHECKED) {
    return EventCheckedEnum.UNCHECKED;
  }

  return EventCheckedEnum.CHECKED;
}

export default function useCheckboxesStatuses(
  channels: Channel[],
  categories: Category[],
  subscriptions: Subscription[]
) {
  const subscriptionOptions: SubscriptionOption[] = useMemo(() => {
    return prepareSubscriptionOptions(categories, channels, subscriptions);
  }, [channels, categories, subscriptions]);

  const [checkboxesState, updateCheckboxesState] = useState<
    Record<string, SubscriptionOption>
  >({});

  const updateStateByNewSubscriptionOption = useCallback(
    (
      subscriptionItem: SubscriptionOption
    ): Record<string, SubscriptionOption> => {
      if (!subscriptionItem.category || !subscriptionItem.channel) {
        throw new Error("Only Events should be used in this method");
      }

      // updated state for the event clicked:
      const nextState = {
        ...checkboxesState,
        [subscriptionItem.key]: {
          ...subscriptionItem
        }
      };

      // Now, it needs to bubble up its category status:
      const targetCategory: Category = categories.find(
        (c) => c.id === subscriptionItem.category!.id
      ) as Category;
      const nextCategoryChecked = checkParentNextStatus(
        targetCategory.events,
        subscriptionItem.channel,
        nextState
      );
      const categoryKey = `${subscriptionItem.channel.id}__${
        subscriptionItem.category!.id
      }`;
      nextState[categoryKey] = {
        ...nextState[categoryKey],
        checked: nextCategoryChecked
      };

      // Now, it needs to bubble status to the Channel:
      const nextChannelStatus = checkParentNextStatus(
        categories,
        subscriptionItem.channel,
        nextState
      );
      nextState[subscriptionItem.channel.id] = {
        ...nextState[subscriptionItem.channel.id],
        checked: nextChannelStatus
      };

      return nextState;
    },
    [checkboxesState, categories]
  );

  /**
   * Click on Checkbox that represents a "group": Category OR Channel
   */
  const onClickGroup = useCallback(
    (option) => () => {
      if (option.type === "channel") {
        const optionCurrentValue = checkboxesState[option.id]?.checked || 0;
        const checked = resolveNextChecked(optionCurrentValue);

        let nextState: Record<string, SubscriptionOption> = {
          ...checkboxesState,
          [option.id]: {
            ...checkboxesState[option.id],
            checked
          }
        };

        // Set Events:
        nextState = subscriptionOptions.reduce((acc, value) => {
          if (
            value.type === "event" &&
            value.channel?.id.startsWith(option.id)
          ) {
            return {
              ...acc,
              [value.key]: {
                ...(subscriptionOptions.find((e) => e.key === value.key) || {}),
                ...acc[value.key as string],
                checked
              }
            };
          }

          return acc;
        }, nextState);

        // Set categories:
        nextState = categories.reduce((acc, category) => {
          return {
            ...acc,
            [`${option.id}__${category.id}`]: {
              key: `${option.id}__${category.id}`,
              type: "category",
              cagegory: { id: category.id, name: category.name },
              checked
            }
          };
        }, nextState);

        return updateCheckboxesState(nextState);
      }

      // The click is in a category group...
      const key = `${option.channel.id}__${option.id}`;
      const optionCurrentValue = checkboxesState[key]?.checked || 0;
      const checked = resolveNextChecked(optionCurrentValue);
      let nextState = {
        ...checkboxesState,
        [key]: {
          ...checkboxesState[key],
          checked
        }
      };

      // se the events that belongs to the category:
      nextState = subscriptionOptions.reduce((acc, value) => {
        if (
          value.type === "event" &&
          value.category?.id === option.id &&
          value.channel?.id.startsWith(option.channel.id)
        ) {
          return {
            ...acc,
            [value.key]: {
              ...(subscriptionOptions.find((e) => e.key === value.key) || {}),
              ...acc[value.key as string],
              checked
            }
          };
        }

        return acc;
      }, nextState);

      // bubble up to channel its new status:
      const nextChannelStatus = checkParentNextStatus(
        categories,
        option.channel,
        nextState
      );
      nextState[option.channel.id] = {
        ...nextState[option.channel.id],
        checked: nextChannelStatus
      };

      updateCheckboxesState(nextState);
    },
    [checkboxesState, subscriptionOptions, categories]
  );

  /**
   * Click on Checkbox that represents a real EVENT
   */
  const onClickEvent = useCallback(
    (subscriptionItem: SubscriptionOption) => () => {
      // only disambiguos TS, since it's an event:
      if (!subscriptionItem.channel || !subscriptionItem.category) {
        throw new Error(
          "Event should not exists without a Category or a Channel"
        );
      }

      const previousValue = checkboxesState[subscriptionItem.key]
        ? checkboxesState[subscriptionItem.key].checked
        : subscriptionItem.checked;
      const checked = resolveNextChecked(previousValue);

      const nextState = updateStateByNewSubscriptionOption({
        ...subscriptionItem,
        checked
      });

      updateCheckboxesState(nextState);
    },
    [checkboxesState, updateStateByNewSubscriptionOption]
  );

  const getCurrentSubscriptions = useCallback((): SubscriptionOption[] => {
    const currentSubscriptionsResult = Object.values(checkboxesState).reduce<
      SubscriptionOption[]
    >((acc, info) => {
      if (info.type && info.type === "event") {
        return [...acc, info];
      }

      return acc;
    }, []);
    return currentSubscriptionsResult;
  }, [checkboxesState]);

  /**
   * In the first time this hook is mounted, run a loop over the existent subscription
   * so the "initial state" is built
   */
  useEffect(() => {
    const initialState = subscriptionOptions.reduce((acc, option) => {
      if (option.checked) {
        return updateStateByNewSubscriptionOption(option);
      }
      return acc;
    }, {});

    updateCheckboxesState(initialState);

    // eslint-disable-next-line
  }, []);

  return {
    checkboxesState,
    onClickGroup,
    onClickEvent,
    subscriptionOptions,
    getCurrentSubscriptions
  };
}
