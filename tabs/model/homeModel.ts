import { createModel } from '~hooks';
import { useState, useEffect } from 'react';
import { sendToBackground } from "@plasmohq/messaging";

function usePageMock() {
  const [pageList, setPageList] = useState([]);
  const [curPage, setCurPage] = useState('');
  const [mockList, setMockList] = useState([]);

  const getPageMockList = async (page: string) => {
    const resp = await sendToBackground({
      name: "mock-data-db",
      body: {
        type: 'getPageMockList',
        payload: page
      }
    });
    return resp;
  }

  const updateMockByPage = async (data: {
    api: string;
    mock: any;
  }) => {
    await sendToBackground({
      name: "mock-data-db",
      body: {
        type: 'updatePageMock',
        payload: {
          page: curPage,
          api: data.api,
          mock: data
        }
      }
    });
  }

  const handleRefreshPage = async () => {
    const _mockList = await getPageMockList(curPage);
    setMockList(_mockList);
  }


  const handleRefreshList = async () => {
    const _pageList = await sendToBackground({
      name: "mock-data-db",
      body: {
        type: 'getPageList'
      }
    });

    setPageList(_pageList);

    if ((!curPage && _pageList[0]) || !_pageList?.includes?.(curPage)) {
      setCurPage(_pageList[0]);
    }
  }

  const handleRemovePageMock = async (page: string) => {
    await sendToBackground({
      name: 'mock-data-db',
      body: {
        type: 'removePageMock',
        payload: page
      }
    });
  }

  useEffect(() => {
    handleRefreshList();
  }, []);

  useEffect(() => {
    async function init() {
      const _mockList = await getPageMockList(curPage);
      setMockList(_mockList);
    }

    init()
  }, [curPage]);

  return {
    pageList,
    curPage,
    mockList,

    setMockList,
    setCurPage,

    updateMockByPage,
    handleRefreshPage,
    handleRefreshList,
    handleRemovePageMock,
  }
}


const useHomeModel = () => {

  const pageMock = usePageMock();

  return {
    ...pageMock
  }

};


export default createModel(useHomeModel);