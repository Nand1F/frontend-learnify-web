import { useContext, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import UsersAdminPage from './UsersAdmin';
import { UserContext } from '../App';
import "../styles/AdminPage.css"
import CoursesAdminPage from './CoursesAdmin';

const AdminPanel = () => {
    const { userAuth } = useContext(UserContext);

    if (userAuth?.user?.role && userAuth?.user?.role !== "admin") {
        return <Navigate to="/404" replace />;
    }

    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get("activetab") || "users";
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        setSearchParams({ activetab: activeTab });
    }, [activeTab, setSearchParams]);

    return (
        <div className="admin-container">
            <h2>Адмін-панель</h2>
            <div className="admin-tabs">
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Користувачі</button>
                <button onClick={() => setActiveTab('courses')} className={activeTab === 'courses' ? 'active' : ''}>Курси</button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && <UsersAdminPage userId={userAuth.user.user_id} />}
                {activeTab === 'courses' && <CoursesAdminPage userId={userAuth.user.user_id}></CoursesAdminPage>}
            </div>
        </div>
    );
};

export default AdminPanel;
