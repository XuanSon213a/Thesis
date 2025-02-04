import React from 'react';
import { Outlet } from 'react-router-dom';
import Page from './Components/Page';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Admin from './Admin';
import Import from './Components/AluminiList/Import';
import Individuals from './Components/AluminiList/Individuals';
import SignIn from './Components/Login/SignIn';
import MessagePage from './Components/Message/MessagePage';
import ChatBox from './Components/Message/Theme/ChatBox';
import SignUp from './Components/Register/SignUp';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Page />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/register",
    element: <SignUp />,
  },
  {
    path: "/logout",
    element: <SignIn />,
  },
  {
    path: "/inv",
    element: <Individuals />,
  },
  {
    path: "/inv/login",
    element: <SignIn />,
  },
  {
    path: "/inv/register",
    element: <SignUp />,
  },
  {
    path: "/news",
    element: <Import />,
  },
  {
    path: "/message/:id",
    element: <MessagePage />,
    children: [
      {
        path: "chat",
        element: <ChatBox />,
      },
      
    ],
  },{
    path: "/message/:id/group", // Tuyến đường cho nhóm
    element: <MessagePage />,
    children: [
      {
        path: "chat",
        element: <ChatBox />,
      },
    ],
  },
  
  // {
  //   path: "/message/:userId",
  //   element: <MessagePage />,
  //   children: [
  //     {
  //       path: "chat",
  //       element: <ChatBox />,
  //     }
  //   ]
  // },
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;