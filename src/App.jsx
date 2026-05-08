import react from 'react'
import Routes from './pages/Routes'
import './App.scss'
import { ConfigProvider } from 'antd'
import { useAuthContext } from './context/Auth'
import ScreenLoader from './components/ScreenLoader'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

function App() {

  const { isAppLoading } = useAuthContext();
  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: '#07887f' } }}>
        {isAppLoading
          ? <ScreenLoader />
          : <Routes />
        }
      </ConfigProvider>
    </>
  )
}

export default App
