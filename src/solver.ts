const getChannelsEnabledByEvent = (
  eventId: string,
  channels: any[],
  subscriptions: any[]
): Record<string, boolean> => {
  const channelIds = subscriptions
    .filter(
      (subscription) =>
        subscription.event.id === eventId &&
        channels.map((channel) => channel.id).includes(subscription.channel.id)
    )
    .map((subscription) => subscription.channel.id);

  return channels.reduce(
    (accChannels, channel) => ({
      ...accChannels,
      [channel.id]: {
        name: channel.name,
        enabled: channelIds.includes(channel.id)
      }
    }),
    {}
  );
};

export const subscriptionsToGridData = (
  selectedProfile: any,
  subscriptions: any[],
  categories: any[],
  channels: any[]
) => {
  return {
    profileName: selectedProfile.name,
    isReadOnly: selectedProfile.readOnly,
    categories: categories.reduce(
      (accCategories, category) => ({
        ...accCategories,
        [category.id]: {
          name: category.name,
          events: category.events.reduce(
            (accEvents, event) => ({
              ...accEvents,
              [event.id]: {
                name: event.name,
                channels: getChannelsEnabledByEvent(
                  event.id,
                  channels,
                  subscriptions
                )
              }
            }),
            {}
          )
        }
      }),
      {}
    )
  };
};

export const gridDataToSubscriptions = (
  { categories }: any,
  subscriptions: any[]
) => {
  const profileSubscription: any[] = [];
  Object.keys(categories).forEach((categoryId) => {
    const gridEvents = categories[categoryId].events;
    Object.keys(gridEvents).forEach((eventId) => {
      const gridChannels = gridEvents[eventId].channels;
      Object.keys(gridChannels).forEach((channelId) => {
        if (gridChannels[channelId].enabled) {
          const event = { id: eventId };
          const channel = { id: channelId };
          const { id } =
            subscriptions.find(
              (subscription) =>
                subscription.channel.id === channelId &&
                subscription.event.id === eventId
            ) || {};
          profileSubscription.push({ id, event, channel });
        }
      });
    });
  });
  return profileSubscription;
};
