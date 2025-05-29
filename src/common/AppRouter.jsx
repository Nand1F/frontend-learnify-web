import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { Navigate, useLocation } from "react-router-dom";

const AppRouter = ({ children, loading }) => {
    const location = useLocation();
    const { userAuth } = useContext(UserContext);
    if (loading) {
        return null; // або спінер
    }
    if (
        userAuth?.user?.isBlocked &&
        location.pathname !== "/blocked"
    ) {
        console.log("Користувача заблоковано")
        return <Navigate to="/blocked" replace />;
    }

    return children;
};

export default AppRouter;