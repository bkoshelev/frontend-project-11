export const getPostData = (postDOM) => ({
  title: postDOM.querySelector('title').textContent,
  link: postDOM.querySelector('link').textContent,
  id: postDOM.querySelector('guid').textContent,
  description: postDOM.querySelector('description').textContent,
});

export const getFeedData = (feedDOM) => ({
  title: feedDOM.querySelector('title').textContent,
  description: feedDOM.querySelector('description').textContent,
  link: feedDOM.querySelector('link').textContent,
});
