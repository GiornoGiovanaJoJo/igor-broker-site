import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './app/App';
import './styles/index.css';

const rawBase = import.meta.env.BASE_URL || '/';
const routerBasename = rawBase === '/' ? undefined : rawBase.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
