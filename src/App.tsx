import { Routes, Route } from 'react-router'
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login'
import HomeWall from './components/HomeWall';
import TrendingWall from './components/TrendingWall';
import Communities from './pages/Communities';
import Community from './pages/Community';
import Chat from './pages/Chat';
import NewPostsWall from './components/NewPostsWall';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}>
          <Route index path="New" element={<NewPostsWall />}/>
          <Route path="Home" element={<HomeWall />}/>
          <Route path="Trending" element={<TrendingWall />}/>
          <Route path="Communities/:communityName" element={<Community />}/>
          <Route path="Communities" element={<Communities />}/>
        </Route>
        <Route path="Login" element={<Login />}/>
        <Route path="Profile/" element={<Profile/>}/>
        <Route path="Profile/:profileName" element={<Profile/>}/>
        <Route path="Chat" element={<Chat />}/>
      </Routes>
    </>
  )
}

export default App
