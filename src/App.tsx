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
  const subscriptionOptions = useMemo(() => {
    return prepareSubscriptionOptions();
  }, []);

  // The "real table" for values (like ReactHookForm internal state):
  const [checkboxesState, updateCheckboxesState] = useState<
    Record<string, SubscriptionOption>
  >({});

  const onClickGroupOption = useCallback(
    (option) => () => {
      if (option.type === "channel") {
        const checked = resolveNextChecked(option.checked);
        // check all that starts with the event id:
      }
    },
    [checkboxesState]
  );

  const onEventClick = useCallback(
    (subscriptionItem: SubscriptionOption) => () => {
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
        (c) => c.id === subscriptionItem.category.id
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

      // Now, it needs to bubble up its event status to the Channel:
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

  console.log(
    "checkboxesState",
    checkboxesState,
    "options",
    subscriptionOptions
  );

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
                          type: "category"
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
