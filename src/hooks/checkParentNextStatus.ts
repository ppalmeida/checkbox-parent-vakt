import { Channel, SubscriptionOption, EventCheckedEnum } from "../types";

interface Item {
  id: string;
}

// Calculate the status of the parent model when the user clicks in a checkbox
function checkParentNextStatus(
  items: Item[],
  channel: Channel,
  currentState: Record<string, SubscriptionOption>
): EventCheckedEnum {
  // loop over the items and check its children current status:
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
