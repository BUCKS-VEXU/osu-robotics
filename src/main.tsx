/* Noah Klein */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Redirect from './common/Redirect';

import ErrorPage from "./ErrorPage";
import Footer from './common/Footer';

import Home from './routes/Home/Home';
import History from './routes/History/History';
import PresencePage from './routes/presence/Presence'

import './index.css';

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
    path: "presence",
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
      },
      {
        path: "merch",
        element: <Redirect href="https://bucksrobotics.myshopify.com/collections/all" />,
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
