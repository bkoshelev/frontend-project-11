import { nanoid } from 'nanoid';

export default class Feeds {
  constructor(state) {
    this.state = state;
  }

  addNewPostToFeed(feed, newPostData) {
    const postId = nanoid();
    this.state.posts
      .set(postId, newPostData);
    this.state.feeds
      .get(feed).posts.push(postId);

    this.state.ui.preview.set(postId, { hasViewed: false });
  }

  addNewFeed(feedUrl, feedData) {
    this.state.feeds
      .set(feedUrl, { ...feedData, posts: [] });
  }

  getFeedPosts(feedUrl) {
    const feedPostsIds = this.state.feeds.get(feedUrl).posts;

    return [...this.state.posts.entries()]
      .filter(([postId]) => feedPostsIds.includes(postId));
  }

  getFeedsList() {
    return [...this.state.feeds.entries()]
      .map(([feedUrl]) => feedUrl);
  }

  setPostAsViewed(postId) {
    this.state.ui.preview.set(postId, {
      ...this.state.ui.preview.get(postId),
      hasViewed: true,
    });
  }
}
