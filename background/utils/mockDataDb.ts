import { Storage } from "@plasmohq/storage";
import { CACHE_MOCK_DATA_KEY } from '~constants';


const storage = new Storage({
  area: 'local'
})

type MockDataPage = {
  [page: string]: {
    [api: string]: {
      enable: boolean;
      mock: any;
      method: string;
      resOptions?: {
        delay?: number;
        resHeaders?: any[];
      };
    }
  }
}


class MockDataDb {

  private limitPage: number;
  private queue: any;
  private isRunning: boolean;

  constructor() {
    this.limitPage = 5;

    this.queue = [];
    this.isRunning = false;
  }

  async getAllMockData() {
    return (await storage.get(CACHE_MOCK_DATA_KEY) as MockDataPage) || {};
  }

  async setAllMockData(payload: any) {
    return storage.set(CACHE_MOCK_DATA_KEY, payload);
  }

  async addPageMock({ page, api, method }: {
    page: string;
    api: string;
    method: string;
  }) {
    this.queue.push(async () => {
      const allMock = await this.getAllMockData();
      if (!allMock[page]) {

        if (Object.keys(allMock).length >= this.limitPage) {
          return;
        }
        allMock[page] = {};
      }

      // 已经有mock数据了
      if (allMock[page][api]) {
        return;
      }

      const resOptions = {
        delay: 0,
        resHeaders: []
      }
      allMock[page][api] = {
        enable: false,
        mock: JSON.stringify({}),
        method,
        resOptions
      };

      this.setAllMockData(allMock);
    });

    this.runSetMockTask();
  }

  async runSetMockTask() {
    if (this.isRunning) return;  // 如果正在运行，直接返回，不启动新的 runSetMockTask
    this.isRunning = true;  // 设置 isRunning 为 true
    while (this.queue.length) {
      const task = this.queue.shift();
      await task();
    }
    this.isRunning = false;  // 所有任务执行完成后，设置 isRunning 为 false
  }

  async updatePageMock({ page, api, mock }: {
    page: string;
    api: string;
    mock: any;
  }) {

    const allMock = await this.getAllMockData();

    if (!allMock[page]) {
      return;
    }

    allMock[page][api] = mock;
    this.setAllMockData(allMock);
  }

  async getPageMockObj(page: string) {
    const allMock = await this.getAllMockData();
    return allMock[page] || {};
  }

  async removePageMock(page: string) {
    const allMock = await this.getAllMockData();
    delete allMock[page];
    await this.setAllMockData(allMock);
  }

  async getPageList() {
    const pageMock = await this.getAllMockData();
    return Object.keys(pageMock);
  }

  async getPageMockList(page: string) {
    const pageMock = await this.getPageMockObj(page);
    return Object.entries(pageMock || {}).map(([api, mockInfo]) => {
      const { enable, mock, method, resOptions } = mockInfo || {};
      return {
        api,
        enable,
        mock,
        method,
        resOptions
      }
    });
  }

  async setMockEnable({ page, api, enable }: {
    page: string;
    api: string;
    enable: boolean;
  }) {
    const allMock = await this.getAllMockData();
    const pageMock = allMock[page];
    if (pageMock[api]) {
      pageMock[api].enable = enable;
    }
    this.setAllMockData(allMock);
  }
}

export const mockDataDb = new MockDataDb();