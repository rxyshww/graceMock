import React from 'react';
import HomeModel from '~tabs/model/homeModel'
import { Tabs } from 'antd';
import styles from './index.module.scss';
import MockList from './components/mock-list';

const Content: React.FC = () => {

  const {
    pageList,
    curPage,
    mockList,
    setCurPage,
    handleRefreshList,
    handleRemovePageMock,
  } = HomeModel.useContext();

  const onEdit = async (targetKey: string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      await handleRemovePageMock(targetKey);
      handleRefreshList();
    }
  };

  return (
    <div className={styles.content}>
      <Tabs
       hideAdd
        activeKey={curPage}
        onChange={setCurPage}
        onEdit={onEdit}
        type="editable-card"
        items={pageList?.map?.((x) => ({
          key: x,
          label: x,
          children: (
            <MockList mockList={mockList} page={x} />
          )
        }))}
      />
    </div>
  )
}

export default Content;