const domParser = new DOMParser();

const xmlToDOM = (xml) => domParser.parseFromString(xml, 'application/xml');

export default xmlToDOM;
