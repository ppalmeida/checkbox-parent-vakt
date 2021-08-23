import "./styles.css";

import React, { useCallback } from "react";
import CustomCheckBox from "./CustomCheckBox";
import { channels, categories } from "./data";
import { SubscriptionOption } from "./types";
import useCheckboxesStatuses from "./hooks/useCheckboxesStatuses";

export default function App() {
  const {
    checkboxesState,
    subscriptionOptions,
    onClickGroupOption,
    onEventClick,
    getCurrentSubscriptions
  } = useCheckboxesStatuses(channels, categories); // `channels` and `categories` here could come as props or useQuery, etc...

  const onSaveClick = useCallback(() => {
    console.log("The final subscriptions are:", getCurrentSubscriptions());
  }, [getCurrentSubscriptions]);

  if (subscriptionOptions.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="checkBoxSection">
        {channels.map((channel) => (
          <div className="verticalBox" key={channel.id}>
            <div className="customCheckboxHolder">
              <CustomCheckBox
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
                              option.channel?.id === channel.id &&
                              option.category?.id === category.id
                            );
                          })
                          .map((option) => {
                            return (
                              <div
                                className="customCheckboxHolder"
                                key={option.key}
                              >
                                <CustomCheckBox
                                  className="customCheckbox"
                                  id={option.event?.id as string}
                                  checked={checkboxesState[option.key]?.checked}
                                  onClick={onEventClick(option)}
                                />
                                <span>{option.event?.name} (Event)</span>
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
      <div className="saveSection">
        <button onClick={onSaveClick}>SAVE</button>
      </div>
    </div>
  );
}
