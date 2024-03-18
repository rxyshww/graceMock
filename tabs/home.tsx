
import HomeModel from './model/homeModel'
import styles from './home.module.scss';
import Title from './components/home/title';
import Content from './components/home/content';

function HomePage() {

  const {
    pageList,
    curPage,
    mockList
  } = HomeModel.useContext();

  console.log('pageList', pageList, curPage, mockList);

  return (
    <div
      className={styles.container}
    >
      <div>
        <Title />
      </div>

      <div>
        <Content />
      </div>
    </div>
  )
}

export default () => (
  <HomeModel.Provider>
    <HomePage />
  </HomeModel.Provider>
)