/* Noah Klein */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import ErrorPage from "./ErrorPage";
import Footer from './common/Footer';

import Home from './routes/Home/Home';
import History from './routes/History/History';

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
      // {
      //   path: "/about",
      //   element: <About />,
      // }
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
