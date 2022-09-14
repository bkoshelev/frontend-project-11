export const addNewPostToFeed = (state, feedId, newPostData) => {
  state.posts.items.push({ id: newPostData.title, ...newPostData });
  const feed = state.feeds.items.find(({ id }) => id === feedId);
  feed.posts.push(newPostData.title);
};

export const addNewFeed = (state, feedUrl, feedData) => {
  state.feeds.items.push({ id: feedUrl, ...feedData, posts: [] });
  state.feeds.ids.push(feedUrl);
};
