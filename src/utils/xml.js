const domParser = new DOMParser();

export const xmlToDOM = (xml) => domParser.parseFromString(xml, 'application/xml');
