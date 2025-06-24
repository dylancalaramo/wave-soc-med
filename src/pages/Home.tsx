import LeftNavbar from '../components/LeftNavbar';
import RightNavbar from '../components/RightNavbar';
import MobileNavbar from '../components/MobileNavbar';
import { Outlet } from 'react-router';
import AddPost from '../components/AddPost';
import { useCallback, useEffect, useState } from 'react';
import ToastMessageBox from '../components/ToastMessageBox';
import { useAuthContext } from '../context/AuthProvider';
import PostDetails from '../components/PostDetails';
import { usePostDetailsContext } from '../context/PostDetailsContext';

const Home = () => {
  const { session } = useAuthContext();
  const { postData, setPostData } = usePostDetailsContext();
  const [showAddpost, setShowAddPost] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if(e.target instanceof Element && (e.target.id === "floating-window-boundary" || e.target.id === "close-btn")) {
        setShowAddPost(false);
        setPostData(null);
    }
  }, [setPostData])

  useEffect(() => {
      if(showAddpost || postData) {
        document.addEventListener('click', handleOutsideClick, true);
      }
      return () => {
        document.removeEventListener('click', handleOutsideClick, true);
      }
  }, [handleOutsideClick, showAddpost, postData])

  return (
      <div className='w-screen h-screen flex flex-col md:flex-row relative overflow-hidden'>
      {/*Render the navbars above the routes component */}
      {/*This will allow the navbars to persist between link visits */}
      <div className='h-100% flex-1 hidden lg:block h-full overflow-y-scroll overflow-x-none [scrollbar-width:none]'>
          <LeftNavbar/>
      </div>
      <div className='block w-screen md:hidden'>
          <MobileNavbar setShowAddPost={setShowAddPost}/>
      </div>
      <div className='flex-2 w-fit overflow-y-auto sm:w-full [scrollbar-width:none]'>
        <div className='w-full h-fit'>
          <Outlet />  
        </div>
      </div>
      <div className='hidden w-60 lg:flex-1 md:flex-[1.1] overflow-y-scroll overflow-x-none [scrollbar-width:none] md:block sm:hidden h-full position:fixed'>
          <RightNavbar setShowAddPost={setShowAddPost}/>
      </div>
      {(showAddpost || postData) && 
        <div className= {`w-screen h-screen bg-[rgba(244,244,244,0.8)]
            fixed top-0 left-0 z-1 overflow-y-auto [scrollbar-width:none]
            grid auto-cols-auto justify-center items-center`} 
            id="floating-window-boundary" 
        >
            {showAddpost ? 
              <AddPost setShowAddPost={setShowAddPost} setToastMessage={setToastMessage} setShowToast={setShowToast} posterUID={session?.user.id}/> :
              <PostDetails post={postData!}/>
            }
        </div>
      }
      <div className="w-fit max-w-[400px] min-w-[250px] h-[fit] fixed top-[50px] left-[50%] translate-x-[-50%]">
        <ToastMessageBox message={toastMessage} setShowToast={setShowToast} showToast={showToast}/>
      </div>
    </div>
  )
}

export default Home;