
import { encode } from "js-base64";
import { mockDataDb, getRefer, getDomainList, getApiPathList } from './';
import { Storage } from "@plasmohq/storage";
import { CACHE_MOCK_ENABLE_KEY } from '~constants';

const storage = new Storage({
  area: 'local'
});

const defaultResponseHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH, PUT, DELETE',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json; charset=utf-8'
}

const cacheMap = new Set();

const sleepWait = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

export async function sendCommand(source, method, params) {
  if (cacheMap.has(source.tabId)) {
    try {
      return await chrome.debugger.sendCommand(source, method, params)
    } catch (r) {
      console.error("Failed to send command:", {
        source,
        method,
        params
      }, `. Error: ${r}`);
    }
  }
}

export async function addAttachItem(t) {
  const domainList = await getDomainList();
  const h5ApiDomainList = await getApiPathList();

  if (t.tabId === chrome.tabs.TAB_ID_NONE) {
    return;
  }

  if (!cacheMap.has(t.tabId)) {
    await chrome.debugger.attach({
      tabId: t.tabId
    }, "1.2");
    cacheMap.add(t.tabId);

    sendCommand({
      tabId: t.tabId
    }, "Fetch.enable", {
      patterns: domainList.concat(h5ApiDomainList).map(item => ({
        urlPattern: `${item}/*`
      }))
    });
  }
}

export async function startDebugger() {
  const domainList = await getDomainList();
  const h5ApiDomainList = await getApiPathList();

  const list = (await new Promise(res => {
    chrome.debugger.getTargets(res)
  }) as any).filter((e => {
    const { origin } = new URL(e.url)
    return e.tabId && domainList.concat(h5ApiDomainList).includes(origin);
  }));

  console.log('list', list);

  for (const tab of list) {
    addAttachItem(tab);
  }
}

export const stopDebugger = async () => {
  for (const tabId of cacheMap) {
    await chrome.debugger.detach({
      tabId: tabId as number
    });
    cacheMap.delete(tabId);
  }
}

export const handleDebugger = async () => {

  const hackEanble = await storage.get(CACHE_MOCK_ENABLE_KEY);

  if (hackEanble) {
    startDebugger();
  } else {
    stopDebugger();
  }
}

async function replaceFetch({
  source,
  params,
  origin,
  extraHeaders = {},
  body,
  accessHeaders = ''
}: {
  source: any;
  params: { requestId: string; request: any };
  extraHeaders?: { [key: string]: string };
  origin?: string;
  body: any;
  accessHeaders: string;
}) {
  const responseCode = params.request.method === 'OPTIONS' ? 200 : 200;

  await sendCommand(source, 'Fetch.fulfillRequest', {
    requestId: params.requestId,
    responseCode: responseCode,
    responseHeaders: Object.entries({
      ...extraHeaders,
      ...defaultResponseHeaders,
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Headers': accessHeaders || '*'
    }).map(([name, value]) => ({
      name,
      value
    })),
    body: encode(body)
  });

  return sendCommand(source, "Fetch.continueRequest", {
    requestId: params.requestId,
    interceptResponse: true
  });
}

const continueFetch = async ({ source, requestId }: { source: any; requestId: string; }) => {
  return sendCommand(source, "Fetch.continueRequest", {
    requestId: requestId
  });
}

export const debugMock = async () => {
  chrome.debugger.onEvent.addListener(async (source, type, params: any) => {
    if ("Fetch.requestPaused" === type) {
      try {
        const refer = await getRefer(source.tabId) as string;
        if (!refer || params.resourceType !== 'XHR') {
          return continueFetch({ source, requestId: params.requestId })
        }

        let { pathname: apiUrl } = new URL(params.request.url);
       
        const apiMap = await mockDataDb.getPageMockObj(refer) || {};

        const curMock = apiMap[apiUrl];

        const accessHeaders = params.request.headers?.['Access-Control-Request-Headers'];

        console.log('accessHeaders', accessHeaders);

        if (curMock?.enable) {
          const { resOptions: { delay, resHeaders } } = curMock;
          if (Number(delay)) {
            await sleepWait(delay);
          }
          const resHeadersObj = resHeaders.reduce((pre, cur) => {
            cur.checked && (pre[cur.name] = cur.value);
            return pre;
          }, {});

          return replaceFetch({
            source,
            params,
            extraHeaders: resHeadersObj,
            origin: params.request?.headers?.Origin,
            body: curMock.mock,
            accessHeaders
          });
        }

        return continueFetch({ source, requestId: params.requestId });
      } catch (e) {
        console.error(e)
        return continueFetch({ source, requestId: params.requestId });
      }
    }
  });
}

const listenTabsUpdate = () => {
  chrome.tabs.onUpdated.addListener((async (tabId, tab) => {
    const hackEanble = await storage.get(CACHE_MOCK_ENABLE_KEY);
    console.log(`Detached from tabId: ${tabId}`, tab);
    if (hackEanble && 'loading' === tab.status) {
      addAttachItem({ tabId })
    }
  }));
}

const listenDetach = () => {
  chrome.debugger.onDetach.addListener((async (e, t) => {
    if (e.tabId && e.tabId !== chrome.tabs.TAB_ID_NONE) {
      console.log(`Detached from tabId: ${e.tabId}, reason: ${t}`);
      cacheMap.delete(e.tabId);
      if (t === 'canceled_by_user') { // 用户手动关闭
        storage.set(CACHE_MOCK_ENABLE_KEY, false);
        cacheMap.clear();
      }
    }
  }));
}

export const handleDebugMock = () => {

  storage.watch({
    [CACHE_MOCK_ENABLE_KEY]: handleDebugger
  });

  handleDebugger();
  debugMock();
  listenTabsUpdate();
  listenDetach();
}

