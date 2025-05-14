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
import ProfilePage from './Components/AluminiList/ProfileDetail/ProfilePage';
import Dashboard from './Components/Admin/Dashboard';
import AlumniManagement from './Components/Admin/AlumniManagement';
import Events from './Components/Admin/Events';
import EventAll from './Components/Admin/EventAll';
import EventDetails from './Components/Admin/EventDetails';
import AdminUsersPage from './Components/Admin/AdminUsersPage';
import News from './Components/Admin/New/News';
import NewsAll from './Components/Admin/New/NewsAll';
import NewsDetails from './Components/Admin/New/NewsDetails';
import ManageOutstandingIndividuals from './Components/Outstanding/ManageOutstandingIndividuals';
import IndividualDetail from './Components/Outstanding/IndividualDetail';
import Organisation from './Components/Admin/Organisation/Organisation';
import OrganisationAll from './Components/Admin/Organisation/OrganisationAll';
import OrganisationDetails from './Components/Admin/Organisation/OrganisationDetails';
import Question from './Components/Admin/Question/Question';
import VoteData from './Components/Vote/VoteData';



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
    path: "/inv/it",
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
    path: "/member/:id",
    element: <ProfilePage />,
  },
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/organisation",
    element: <Organisation />,
  },
  {
    path: "/admin/users",
    element: <AdminUsersPage />,
  },
  {
    path: "/admin/events",
    element: <Events />,
  },
  {
    path: "/admin/news",
    element: <News />,
  },
  {
    path: "/event",
    element: <EventAll />,
  },
  {
    path: "/event/:id",
    element: <EventDetails />,
  },
  {
    path: "/news",
    element: <NewsAll />,
  },
  {
    path: "/news/:id",
    element: <NewsDetails />,
  },
  {
    path: "/org",
    element: <OrganisationAll />,
  },
  {
    path: "/org/:id",
    element: <OrganisationDetails />,
  },
  {
    path: "/admin/alumnis",
    element: <AlumniManagement />,
  },
  {
    path: "/admin/manage-outstanding",
    element: <ManageOutstandingIndividuals />,
  },
  {
    path: "/votedata",
    element: <VoteData />,
  },
  {
    path: "/admin/question",
    element: <Question />,
  },
  {
    path: "/individual/:id",
    element: <IndividualDetail />,
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