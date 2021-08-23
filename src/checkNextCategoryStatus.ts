import {
  Category,
  Channel,
  Event,
  SubscriptionOption,
  EventCheckedEnum
} from "./types";

interface Item {
  id: string;
}

// Calculate the status of the category when the user clicks in a event checkbox
function checkParentNextStatus(
  items: Item[],
  channel: Channel,
  currentState: Record<string, SubscriptionOption>
): EventCheckedEnum {
  // loop over the categories and check its events current status:
  const itemsStatuses = items.map((item: Item) => {
    const key = `${channel.id}__${item.id}`;
    return currentState[key]?.checked || EventCheckedEnum.UNCHECKED;
  });

  if (
    !itemsStatuses.includes(EventCheckedEnum.UNCHECKED) &&
    !itemsStatuses.includes(EventCheckedEnum.UNSOLVED)
  ) {
    return EventCheckedEnum.CHECKED;
  }
  if (
    !itemsStatuses.includes(EventCheckedEnum.CHECKED) &&
    !itemsStatuses.includes(EventCheckedEnum.UNSOLVED)
  ) {
    return EventCheckedEnum.UNCHECKED;
  }

  return EventCheckedEnum.UNSOLVED;
}

export default checkParentNextStatus;

/*
import {
  Category,
  Channel,
  Event,
  SubscriptionOption,
  EventCheckedEnum
} from "./types";

// Calculate the status of the category when the user clicks in a event checkbox
function checkNextCategoryStatus(
  category: Category,
  channel: Channel,
  currentState: Record<string, SubscriptionOption>
): EventCheckedEnum {
  // loop over the categories and check its events current status:
  const categoryEventsStatuses = category.events.map((event: Event) => {
    const key = `${channel.id}__${event.id}`;
    return currentState[key]?.checked || EventCheckedEnum.UNCHECKED;
  });

  if (categoryEventsStatuses.indexOf(EventCheckedEnum.UNCHECKED) === -1) {
    return EventCheckedEnum.CHECKED;
  }
  if (categoryEventsStatuses.indexOf(EventCheckedEnum.CHECKED) === -1) {
    return EventCheckedEnum.UNCHECKED;
  }

  return EventCheckedEnum.UNDETERMINATED;
}

export default checkNextCategoryStatus;
*/
