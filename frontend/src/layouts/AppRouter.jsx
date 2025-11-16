import { createBrowserRouter } from 'react-router-dom';
import AdminLoginPage from '../Admin/routes/AdminLoginPage'; 
import ClientLoginPage from "../Client/routes/ClientLoginPage"
import ClientRoute from '../Client/routes/ClientRoute';
import ProtectedRoute from '../contexts/ProtectedRoute'; 
import NotFound from './NotFound';
import RouteBack from '../Admin/routes/RouteBack'
import { ThemeProvider } from "../Admin/contexts/theme-context";


const AppRoutes = createBrowserRouter([
    { 
        path: '/login', 
        element: <ClientLoginPage /> 
    },
    { 
        path: '/admin/login', 
        element: <AdminLoginPage />
    },
    {
        path: '/*',
        element: <ClientRoute />
    },
    { 
        path: '/admin/*', 
        element: (
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <ThemeProvider storageKey="theme">
                    <RouteBack/>
                </ThemeProvider>
            </ProtectedRoute>
        ) 
    },
    { 
        path: '*', 
        element: <NotFound/> 
    },
]);

export default AppRoutes;