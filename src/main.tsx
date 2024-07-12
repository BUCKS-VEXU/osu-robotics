/* Noah Klein */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

import ErrorPage from "./ErrorPage";

import './index.css';
import Home from './routes/Home/Home';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
]);


// The ! tells TS not to worry about NULL here
ReactDOM.createRoot(document.getElementById("root")!).render(
  // Strict mode makes events fire twice to check for side effects
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
