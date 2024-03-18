
import { Collapse, Checkbox, Tag } from 'antd';
import styles from './index.module.scss';
import homeModel from "~tabs/model/homeModel";
import RenderApiItem from '../render-api-item';

type MockItem = {
  api: string;
  branch: string;
  psm: string;
  mock: any;
  enable: boolean;
  method: string;
  resOptions: any[];
};

const MockList = ({ page, mockList }: {
  page: string;
  mockList: MockItem[];
}) => {
  const { updateMockByPage, handleRefreshPage } = homeModel.useContext();

  // console.log('mockList', mockList);

  const handleEnableApi = async (checked: boolean, mockData: MockItem) => {
    const _mockData = JSON.parse(JSON.stringify(mockData));
    _mockData.enable = checked;
    await updateMockByPage(_mockData);
    handleRefreshPage();
  }

  return (
    <div>
      <h3 style={{ paddingLeft: 16 }}>
        <span>APIMock</span>
      </h3>
      <Collapse
        bordered={false}
        items={mockList?.map(item => ({
          key: item.api,
          label: (
            <div className={styles.header}>
              <div className={styles.infoWrap}>
                <span onClick={e => e.stopPropagation()}>
                  <Checkbox checked={item?.enable} onChange={e => handleEnableApi(e.target.checked, item)}>{item.api}</Checkbox>
                </span>
                <Tag className={styles.tag} color="green">{item.method}</Tag>
              </div>
            </div>
          ),
          children: <RenderApiItem page={page} key={item.api} {...item} />
        }))}
      />
      {/* <RenderApiItem page={page} mockList={mockList}/> */}
      {/* <Collapse bordered={false}>
        {mockList?.map((item, _index) => (
          <RenderApiItem page={page} key={item.api} {...item} />
        ))}
      </Collapse> */}
    </div>
  )
}

export default MockList;