import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navigation/Navbar"; 
import Footer from "../Navigation/Footer"; 
import SideBar from "../Navigation/SideBar"; 
import { useLocation } from 'react-router-dom';
import { NavBarProvider } from "../context/NavbarContext";
import {PanierProvider} from "../context/PanierContext"
import {UsersProvider} from "../context/UserContext"
import PanierDrawer from "../Pages/Produit/PanierDrawer"
import { AuthProvider } from "@/contexts/AuthContext";

function ClientLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() =>{
    const header = document.querySelector("header");
    if (header){
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
      )
      //mt-[var(--header-height)]
    }
  },[]);
    return (
      <AuthProvider>
      <UsersProvider>
      <PanierProvider>
        <NavBarProvider>
          <PanierDrawer >
              <div className=" bg-slate-100 transition-colors dark:bg-slate-950">
                  <header className="fixed z-50">
                    <Navbar /> 
                  </header>
                    { (currentPath !== '/') ? (
                      <div className=" lg:mt-[110px] md:mt-[120px] mt-[130px] flex">
                        {currentPath === "/Produit" && 
                          <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden  md:block">
                          <SideBar />
                          </div>
                        } 
                          <div className={`w-full ${currentPath !== "/passerCommande" ? "overflow-y-auto h-[calc(100vh-60px)]" :"dark:bg-slate-900"}   p-5`}>
                            <Outlet />
                          </div>
                      </div>
                    ) : (
                      <div className=" mt-[90px]">
                        <Outlet />
                      </div>
                    )  }
                  <Footer />
              </div>
              </PanierDrawer>
        </NavBarProvider>
        </PanierProvider>
        </UsersProvider>
        </AuthProvider>
    );
}

export default ClientLayout;
