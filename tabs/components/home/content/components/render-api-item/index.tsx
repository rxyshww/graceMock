
import { Collapse, Checkbox, Tag, Form, InputNumber } from 'antd';
import AceEditor from '~tabs/components/ace-editor';
import homeModel from "~tabs/model/homeModel";
import styles from './index.module.scss';
import { useEffect } from 'react';

const CollapseItem = Collapse.Panel;

function getCode(data: any) {
  return JSON.stringify(data);
}

const RenderApiItem = (mockData: {
  page: string;
  api: string;
  mock: any;
  enable: boolean;
  method: string;
  resOptions?: any;
}) => {

  const {
    mock, resOptions
  } = mockData;

  const [form] = Form.useForm();

  const { updateMockByPage, handleRefreshPage } = homeModel.useContext();

  const setCode = async (value: string) => {
    try {
      const _mockData = JSON.parse(JSON.stringify(mockData));
      JSON.parse(value);
      _mockData.mock = value;
  
      await updateMockByPage(_mockData);
      handleRefreshPage();
    } catch { }
  }

  const handleEnableApi = async (checked: boolean) => {
    const _mockData = JSON.parse(JSON.stringify(mockData));
    _mockData.enable = checked;
    await updateMockByPage(_mockData);
    handleRefreshPage();
  }

  const handleValuesChange = (_value, values) => {
    const _mockData = JSON.parse(JSON.stringify(mockData));
    _mockData.resOptions = values;
    updateMockByPage(_mockData);
  }

  useEffect(() => {
    form.setFieldsValue(resOptions)
  }, [resOptions]);

  console.log('mock', mock)

  return (
    <>
     <AceEditor
        style={{ width: '100%' }}
        mode="json"
        theme="github"
        tabSize={2}
        fontSize={12}
        value={mock}
        onChange={setCode}
      />

      <Form
        style={{ marginTop: 12 }}
        labelCol={{ span: 3 }}
        labelAlign="left"
        form={form}
        autoComplete='off'
        layout='vertical'
        onValuesChange={handleValuesChange}
      >
        <Form.Item label='延迟(ms)' name='delay'>
          <InputNumber placeholder='输入延迟' style={{ width: 200 }} />
        </Form.Item>
      </Form>
    </>
  )
}

export default RenderApiItem;