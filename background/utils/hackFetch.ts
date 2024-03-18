import { Storage } from "@plasmohq/storage";
import { CACHE_MOCK_ENABLE_KEY, CACHE_CONFIG_DOMAIN_LIST, CACHE_CONFIG_PATH_LIST } from '~constants';
import { getRefer, getDomainList, getApiPathList } from './common';
import { mockDataDb } from './';

const localRage = new Storage({
  area: 'local'
});

const storage = new Storage();

const onBeforeRequestListener = async (details: chrome.webRequest.WebRequestBodyDetails) => {
  if (details.initiator?.includes('chrome-extension') || details.method === 'OPTIONS' || details.type !== 'xmlhttprequest') {
    return;
  }

  // console.log('details request', details);

  const completeUrl = details.url;

  let { pathname } = new URL(completeUrl);
  const authList = await getApiPathList();

  if (!authList.some(item => pathname.startsWith(item))) {
    return;
  }

  const refer = await getRefer(details.tabId) as string;

  const mockMap = await mockDataDb.getPageMockObj(refer);

  console.log('refer', refer, pathname, mockMap)

  mockDataDb.addPageMock({
    page: refer,
    api: pathname,
    method: details.method,
  });

};

const reloadFetchHandle = async () => {
  const hackEanble = await localRage.get(CACHE_MOCK_ENABLE_KEY);
  const domainList = (await getDomainList()).map(item => `${item}/*`) || [];

  if (hackEanble) {
    if (chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequestListener as any)) {
      chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener as any);
    }
    if (!domainList?.length) {
      return
    }
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestListener as any,
      // 过滤条件
      { urls: domainList },
      ['requestBody']
    );
  } else {
    if (!chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequestListener as any)) {
      return;
    }
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener as any);
  }

};

export const handleFetch = () => {

  localRage.watch({
    [CACHE_MOCK_ENABLE_KEY]: reloadFetchHandle
  });

  storage.watch({
    [CACHE_CONFIG_DOMAIN_LIST]: reloadFetchHandle,
    [CACHE_CONFIG_PATH_LIST]: reloadFetchHandle
  });

  reloadFetchHandle();
}