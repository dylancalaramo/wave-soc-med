import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//handles the page navigation of your react app
//wrap this into your main app component to allow react-router functionality
import { BrowserRouter } from 'react-router';

//QueryClient creates an instance a client of your react app
//Pass the queryClient to the queryClientProvider to allow your app to use react query
//for state management, backend connection to postgresql database, etc.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthProvider.tsx';
import { PostDetailsProvider } from './context/PostDetailsContext.tsx';

const user = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={user}>
      <BrowserRouter>
        <PostDetailsProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PostDetailsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
