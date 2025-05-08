import { useState } from "react";
import "./index.css"
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage"
import {Toaster} from 'react-hot-toast';
import {  useQuery } from "@tanstack/react-query";


function App() {
  // using daisu ui and tailwindcsss
 
  // protected route made in backend (fectching here)
  const {data:authUser, isLoading, isError, error} = useQuery({
    queryKey:["authUser"], // to be able to refernce queries somewhere without defining this whole function
    queryFn: async() =>{
      try {
        const res = await fetch("/api/auth/me");
        const data= await res.json();
        if(data.error) return null;
        if(!res.ok) throw new Error (data.error || "something went wrong");
        console.log("authUser is here: ", data);
        return data;
      } catch (error) {
        throw new Error (error);
      }
    },
    retry: false,
  })

  

  return (
    <div className="flex max-w-6xl mx-auto" >
      {/* common componetns */}
      {authUser && <Sidebar  />}
      <Routes>
        {/* Protecting routes here  */}
        <Route path = "/" element = {authUser ? <HomePage /> : <Navigate to = "/login" />}  />
        <Route path = "/login" element = {!authUser ? <LoginPage/> :  <Navigate to = "/" />  } />
        <Route path = "/signup" element = {!authUser ?<SignUpPage /> :  <Navigate to = "/" />  } />
        <Route path = "/notifications" element= {authUser ? <NotificationPage/> :  <Navigate to = "/login" />} />
        <Route path = "/profile/:username" element = {authUser ? <ProfilePage/> :  <Navigate to = "/login" /> }  />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
