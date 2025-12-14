import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OwnerRouteProps {
    children: React.ReactElement;
}

const OwnerRoute: React.FC<OwnerRouteProps> = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'OWNER') {
        // Si no es barbero, lo mandamos al área de cliente
        return <Navigate to="/app/new-booking" replace />;
    }

    return children;
};

export default OwnerRoute;
