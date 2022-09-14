const domParser = new DOMParser();

class XMLError extends Error {
  name = 'XMLError';
}

const getPostData = (postXML) => ({
  title: postXML.querySelector('title').textContent,
  link: postXML.querySelector('link').textContent,
  description: postXML.querySelector('description').textContent,
});

const getPosts = (feedXML) => [...feedXML.querySelectorAll('item')]
  .reverse()
  .map(getPostData);

const getFeedData = (feedXML) => {
  const feedData = ({
    title: feedXML.querySelector('title').textContent,
    description: feedXML.querySelector('description').textContent,
    link: feedXML.querySelector('link').textContent,
  });
  return feedData;
};

const XMLparse = (string) => {
  const xml = domParser.parseFromString(string, 'application/xml');

  const errorNode = xml.querySelector('parsererror');
  if (errorNode) {
    throw new XMLError();
  } else {
    return {
      feedData: getFeedData(xml),
      posts: getPosts(xml),
    };
  }
};

export default XMLparse;
