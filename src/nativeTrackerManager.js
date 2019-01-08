/*
 * Script to handle firing impression and click trackers from native teamplates
 */
import { parseUrl } from './utils';

const AD_ANCHOR_CLASS_NAME = 'pb-click';
const AD_DATA_ADID_ATTRIBUTE = 'pbAdId';

export function newNativeTrackerManager(win) {
  let publisherDomain;

  function findAdElements(className) {
    let adElements = win.document.getElementsByClassName(className);
    return adElements || [];
  }
  
  function readAdIdFromElement(adElements) {
    let adId = (adElements.length > 0) &&
      adElements[0].attributes &&
      adElements[0].attributes[AD_DATA_ADID_ATTRIBUTE] &&
      adElements[0].attributes[AD_DATA_ADID_ATTRIBUTE].value;
    return adId || '';
  }
  
  function readAdIdFromEvent(event) {
    let adId =
      event &&
      event.currentTarget &&
      event.currentTarget.attributes &&
      event.currentTarget.attributes[AD_DATA_ADID_ATTRIBUTE] &&
      event.currentTarget.attributes[AD_DATA_ADID_ATTRIBUTE].value;
  
    return adId || '';
  }
  
  function loadClickTrackers(event) {
    let adId = readAdIdFromEvent(event);
    fireTracker(adId, 'click');
  }
  
  function loadImpTrackers(adElements) {
    let adId = readAdIdFromElement(adElements);
    fireTracker(adId, 'impression');
  }
  
  function fireTracker(adId, action) {
    if (adId === '') {
      console.warn('Prebid tracking event was missing \'adId\'.  Was adId macro set in the HTML attribute ' + AD_DATA_ADID_ATTRIBUTE + 'on the ad\'s anchor element');
    } else {
      let message = { message: 'Prebid Native', adId: adId };
  
      // fires click trackers when called via link
      if (action === 'click') {
        message.action = 'click';
      }
  
      win.parent.postMessage(JSON.stringify(message), publisherDomain);
    }
  }
  
  // START OF MAIN CODE
  let startTrackers = function (tagData) {
    let parsedUrl = parseUrl(tagData && tagData.pubUrl);
    publisherDomain = parsedUrl.protocol + '://' + parsedUrl.host;

    let adElements = findAdElements(AD_ANCHOR_CLASS_NAME);
    for (let i = 0; i < adElements.length; i++) {
      adElements[i].addEventListener('click', loadClickTrackers, true);
    }
  
    // fires native impressions on creative load
    if (adElements.length > 0) {
      loadImpTrackers(adElements);
    }
  }

  return {
    startTrackers
  }
}
