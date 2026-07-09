import { StrictMode } from 'react'
   import { createRoot } from 'react-dom/client'
   import './index.css'
   import ComplexityCommons from './complexity-commons.jsx'

   createRoot(document.getElementById('root')).render(
     <StrictMode>
       <ComplexityCommons />
     </StrictMode>,
   )