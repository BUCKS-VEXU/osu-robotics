/* Noah Klein */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import ErrorPage from "./ErrorPage";
import Footer from './common/Footer';

import Home from './routes/Home/Home';
import History from './routes/History/History';
import PresencePage from './routes/presence/PresencePage'

import './index.css';
import PresenceTapPage from './routes/presence/Tap';

const App = () => {
  return (
    <>
      {/* <NavBar /> */}
      <div id="content" >
        <Outlet />
      </div >
      <Footer />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/presence/tap",
    element: <PresenceTapPage />,
  },
  {
    path: "/presence",
    element: <PresencePage />,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "history/",
        element: <History />,
      }
    ],
  },
]);


// The ! tells TS not to worry about NULL here
ReactDOM.createRoot(document.getElementById("root")!).render(
  // Strict mode makes events fire twice to check for side effects
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
