import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import {
  CACHE_CONFIG_DOMAIN_LIST,
  CACHE_CONFIG_PATH_LIST,
} from "~constants";
import styles from "./index.module.scss";
import { Drawer, Input, Tag } from "antd";
import { getValidDomain, getValidApiPath } from '~utils';

const { TextArea } = Input;

const storage = new Storage();

interface PsmDrawerProps {
  visible: boolean;
  onVisible: (v: boolean) => void;
}

const Droplist = ({ list = [] }) => (
  <div className={styles.popup}>
    {list.map(item => (
      <div className={styles.listItem} key={item}>{item}</div>
    ))}
  </div>
);

const ProjectConfig = ({ visible, onVisible }: PsmDrawerProps) => {

  const [domainList, setDomainList] = useStorage({
    key: CACHE_CONFIG_DOMAIN_LIST,
    instance: storage
  }, '');

  const [apiList, setApiList] = useStorage({
    key: CACHE_CONFIG_PATH_LIST,
    instance: storage
  }, '');

  const validDomainList = getValidDomain(domainList);
  const validApiList = getValidApiPath(apiList);

  return (
    <Drawer
      width={600}
      title={<span>项目全局配置</span>}
      open={visible}
      footer={null}
      onClose={() => {
        onVisible(false);
      }}
    >
      <h3>设置生效域名：</h3>

      <TextArea
        value={domainList}
        placeholder="输入域名，多个用英文逗号隔开"
        onChange={e => setDomainList(e.target.value)}
        autoSize={{ minRows: 3, maxRows: 5 }}
      />

      <div className={styles.validDomain}>
        有效域名：{validDomainList.map(item => <Tag bordered={false} color="processing" key={item}>{item}</Tag>)}
      </div>

      <h3>设置生效接口前缀：</h3>

      <TextArea
        value={apiList}
        placeholder="输入接口前缀，多个用英文逗号隔开"
        onChange={e => setApiList(e.target.value)}
        autoSize={{ minRows: 3, maxRows: 5 }}
      />

      <div className={styles.validDomain}>
        有效接口前缀：{validApiList.map(item => <Tag bordered={false} color="processing" key={item}>{item}</Tag>)}
      </div>
    </Drawer>
  );
}

export default ProjectConfig;