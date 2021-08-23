import "./styles.css";

import React from "react";
import CustomCheckBox from "./CustomCheckBox";
import { channels, categories } from "./data";
import { SubscriptionOption } from "./types";
import useCheckboxesStatuses from "./hooks/useCheckboxesStatuses";

export default function App() {
  const {
    // The "real table" for values (like ReactHookForm internal state):
    checkboxesState,
    subscriptionOptions,
    onClickGroupOption,
    onEventClick
  } = useCheckboxesStatuses(channels, categories);

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
                            option.channel?.id === channel.id &&
                            option.category?.id === category.id
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
  );
}
