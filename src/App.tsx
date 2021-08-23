import "./styles.css";

import CustomCheckBox from "./CustomCheckBox";
import { channels, categories, prepareSubscriptionOptions } from "./data";
import React, { useCallback, useMemo, useState } from "react";
import { SubscriptionOption, EventCheckedEnum, Category } from "./types";
import checkParentNextStatus from "./checkNextCategoryStatus";

const resolveNextChecked = (status: EventCheckedEnum): EventCheckedEnum => {
  if (status === EventCheckedEnum.CHECKED) {
    return EventCheckedEnum.UNCHECKED;
  }

  return EventCheckedEnum.CHECKED;
};

export default function App() {
  // This could come as a prop or from a custom hook from reactQuery etc...
  const subscriptionOptions: SubscriptionOption[] = useMemo(() => {
    return prepareSubscriptionOptions();
  }, []);

  // The "real table" for values (like ReactHookForm internal state):
  const [checkboxesState, updateCheckboxesState] = useState<
    Record<string, SubscriptionOption>
  >({});

  // onClick for Group items (categories/channels)
  const onClickGroupOption = useCallback(
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
          if (value.channel?.id.startsWith(option.id)) {
            return {
              ...acc,
              [value.key]: {
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

      nextState = nextState = subscriptionOptions.reduce((acc, value) => {
        if (value.category?.id.startsWith(option.id)) {
          return {
            ...acc,
            [value.key]: {
              ...acc[value.key as string],
              checked
            }
          };
        }

        return acc;
      }, nextState);

      updateCheckboxesState(nextState);
    },
    [checkboxesState, subscriptionOptions]
  );

  // onClick for events (the real values):
  const onEventClick = useCallback(
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

      // updated state for the event clicked:
      const nextState = {
        ...checkboxesState,
        [subscriptionItem.key]: {
          ...subscriptionItem,
          checked
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
      const categoryKey = `${subscriptionItem.channel.id}__${subscriptionItem.category.id}`;
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

      updateCheckboxesState(nextState);
    },
    [checkboxesState]
  );

  if (subscriptionOptions.length === 0) {
    return null;
  }

  return (
    <div className="checkBoxSection">
      {channels.map((channel) => (
        <div className="verticalBox">
          <div className="customCheckboxHolder">
            <CustomCheckBox
              key={channel.id}
              className="customCheckbox"
              id={channel.id}
              checked={checkboxesState[channel.id]?.checked}
              onClick={onClickGroupOption({ ...channel, type: "channel" })}
            />
            <span>{channel.name} (Channel)</span>
          </div>
          <div>
            {categories.map((category) => {
              const key = `${channel.id}__${category.id}`;
              // console.log("category  key", key);
              return (
                <div className="verticalBox" key={key}>
                  <div className="checkBoxSection">
                    <div className="customCheckboxHolder">
                      <CustomCheckBox
                        className="customCheckbox"
                        id={category.id}
                        checked={checkboxesState[key]?.checked}
                        onClick={onClickGroupOption({
                          ...category,
                          type: "category",
                          channel
                        })}
                      />
                      <span>{category.name} (Category)</span>
                    </div>
                  </div>
                  <div>
                    <div className="checkBoxSection eventCheckboxSection">
                      {subscriptionOptions
                        .filter((option: SubscriptionOption) => {
                          return (
                            option.channel.id === channel.id &&
                            option.category.id === category.id
                          );
                        })
                        .map((option) => {
                          // console.log("event key", option.key);
                          return (
                            <div
                              className="customCheckboxHolder"
                              key={option.key}
                            >
                              <CustomCheckBox
                                className="customCheckbox"
                                id={option.event.id}
                                checked={checkboxesState[option.key]?.checked}
                                onClick={onEventClick(option)}
                              />
                              <span>{option.event.name} (Event)</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
