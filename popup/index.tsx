import { useEffect } from 'react';
import styles from './index.module.scss';
import { Button  } from 'antd';
import Control from '~tabs/components/control';

function IndexPopup() {
  const handleClick = () => {
    window.open(`chrome-extension://${chrome.runtime.id}/tabs/home.html`)
  }

  return (
    <div
      className={styles.popupWrap}
    >
      <h2 className={styles.logoCtrl}>
        GraceMock
      </h2>

      <Control />

      <Button type='primary' className={styles.btnWrap} onClick={handleClick}>编辑接口信息</Button>
    </div>
  )
}

export default IndexPopup
