/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './pages/Home'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    },
  },
})

const SearchResult = lazy(() => import('./pages/SearchResult'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))

const router = createBrowserRouter([
  {path: '/', element: <Home/>},
  {path: 'search', element: <Suspense fallback={null}><SearchResult/></Suspense>},
  {path: 'product/:id', element: <Suspense fallback={null}><ProductDetails/></Suspense>},
  {path: 'cart', element: <Suspense fallback={null}><Cart /></Suspense>},
  {path: 'checkout', element: <Suspense fallback={null}><Checkout /></Suspense>},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
)
