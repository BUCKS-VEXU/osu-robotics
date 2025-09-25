/* Noah Klein */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';

import ErrorPage from './ErrorPage';
import Footer from './common/Footer';

import Home from './Home/Home';
import History from './History/History';
import PresencePage from './Presence/PresencePage';
import PresenceTapPage from './Presence/Tap';
import AdminPanel from './Admin/AdminPanel';

const App = () => {
  return (
    <>
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/presence/tap" element={<PresenceTapPage />} />
        <Route path="/presence" element={<PresencePage />} />

        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="history/" element={<History />} />
        </Route>

        <Route path="/admin" element={<AdminPanel />} />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Strict mode makes events fire twice to check for side effects
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
