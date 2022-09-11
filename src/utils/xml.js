const domParser = new DOMParser();

const XMLparse = (string) => {
  const xml = domParser.parseFromString(string, 'application/xml');

  const errorNode = xml.querySelector('parsererror');
  if (errorNode) {
    const error = new Error();
    error.name = 'XMLError';
    throw error;
  } else {
    return xml;
  }
};

const getPostData = (postXML) => ({
  title: postXML.querySelector('title').textContent,
  link: postXML.querySelector('link').textContent,
  description: postXML.querySelector('description').textContent,
});

export default class XMLFeed {
  constructor(feedString) {
    this.feedXML = XMLparse(feedString);
  }

  getFeedData() {
    const feedData = ({
      title: this.feedXML.querySelector('title').textContent,
      description: this.feedXML.querySelector('description').textContent,
      link: this.feedXML.querySelector('link').textContent,
    });
    return feedData;
  }

  getPosts() {
    return [...this.feedXML.querySelectorAll('item')]
      .reverse()
      .map(getPostData);
  }
}
