import "./styles.css";

import CustomCheckBox from "./CustomCheckBox";
import { channels, categories } from "./data";
import React, { useMemo } from "react";
import { SubscriptionOption } from "./types";
import useCheckboxesStatuses, {
  prepareSubscriptionOptions
} from "./hooks/useCheckboxesStatuses";

export default function App() {
  // This could come as a prop or from a custom hook from reactQuery etc...
  const subscriptionOptions: SubscriptionOption[] = useMemo(() => {
    return prepareSubscriptionOptions(categories, channels);
  }, []);

  const {
    // The "real table" for values (like ReactHookForm internal state):
    checkboxesState,
    onClickGroupOption,
    onEventClick
  } = useCheckboxesStatuses(categories, subscriptionOptions);

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
