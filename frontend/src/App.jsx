import React from 'react';
import { RouterProvider } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './layouts/AppRouter';

function App() {
  return (
    // <AuthProvider>
      <RouterProvider router={AppRoutes} />
    // </AuthProvider>
  );
}

export default App;
