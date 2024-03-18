
import { getValidDomain, getValidApiPath } from '~utils';
import { Storage } from '@plasmohq/storage';
import { CACHE_CONFIG_DOMAIN_LIST, CACHE_CONFIG_PATH_LIST } from '~constants';

const storage = new Storage();

export async function getRefer(tabId: number) {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => {
      try {
        let { pathname } = new URL(tab.url);
        pathname = pathname.replace('/obj/byte-gurd-source-gr/webcast/mono/h5', '');
        resolve(pathname);
      } catch (e) {
        reject(e)
      }
    });
  })
}

export const getDomainList = async () => {
  const domainList = await storage.get(CACHE_CONFIG_DOMAIN_LIST);
  return getValidDomain(domainList);
}

export const getApiPathList = async () => {
  const pathList = await storage.get(CACHE_CONFIG_PATH_LIST);
  return getValidApiPath(pathList);
}

