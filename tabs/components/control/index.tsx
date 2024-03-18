
import styles from "./index.module.scss";
import { Switch } from 'antd';
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from '@plasmohq/storage';
import { CACHE_MOCK_ENABLE_KEY } from '~constants';

const storage = new Storage({
  area: 'local'
});

const Control = () => {

  const [mockEnable, setMockEnable] = useStorage({
    key: CACHE_MOCK_ENABLE_KEY,
    instance: storage
  });

  return (
    <div className={styles.controlWrap}>
      <div className={styles.controlItem}>
        <div>开启mock：</div>
        <Switch checked={mockEnable} onChange={setMockEnable} />
      </div>
    </div>
  )
};

export default Control;