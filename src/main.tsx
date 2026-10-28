import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import SearchResult from './pages/SearchResult'
import ProductDetails from './pages/ProductDetails'

const router = createBrowserRouter([
  {path: '/', element: <Home/>},
  {path: 'search', element: <SearchResult/>},
  {path: 'product/:id', element: <ProductDetails/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
