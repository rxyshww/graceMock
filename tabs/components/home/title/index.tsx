import { useState } from 'react';
import styles from "./index.module.scss";
import Control from '../../control';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import ProjectConfig from "./components/project-config";

const Title = ({ hideCtrl = false }: { hideCtrl?: boolean }) => {
  const [configShow, setConfigShow] = useState(false);

  return (
    <div className={styles.titleCtrl}>
      <div className={styles.graceTitle}>
        <h2 className={styles.logo}>GraceMock</h2>
      </div>

      {!hideCtrl && (
        <div className={styles.controlWrap}>
          <Control />
          <Button className={styles.btn} type="primary" onClick={() => setConfigShow(true)} icon={<SettingOutlined />}>项目配置</Button>
        </div>
      )}

      <ProjectConfig
        visible={configShow}
        onVisible={setConfigShow}
      />
    </div>
  )
};

export default Title;