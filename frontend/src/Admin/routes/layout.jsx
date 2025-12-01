import { Outlet } from "react-router-dom";
import { SearchProvider} from '../contexts/SearchContext';
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "../hooks/use-click-outside";
import { Sidebar } from "../layouts/sidebar";
import { Header } from "../layouts/header";
import {SideProduit} from "../layouts/sideProduit"
import { cn } from "../utils/cn";
import { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';

const Layout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);
    const location = useLocation();
    const currentPath = location.pathname;
    const sidebarRef = useRef(null);

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

 
    return (
        <SearchProvider>
        <div className="min-h-screen bg-gray-50 transition-colors dark:bg-slate-950">
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                    !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                )}
            />
            <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
            />
            <div className={cn("transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                <div className="flex w-full">
                    {currentPath === '/admin/products' && (
                        <div className="w-1/4">
                            <SideProduit />
                        </div>
                    )}
                    <div className={` ${currentPath !== '/admin/ficheCommande' ? (currentPath !== '/admin/products' ? "p-3  w-full" : "px-0 h-[550px] w-3/4") : "h-[calc(100vh-60px)]  overflow-y-auto overflow-x-hidden w-full"}`}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
        </SearchProvider>
    );
};

export default Layout;
