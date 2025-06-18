import { useEffect, useState } from 'react';
import "../styles/UsersAdmin.css"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UsersAdminPage = ({ userId }) => {
    const [users, setUsers] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const limit = 20;
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(true);
    }, []);

    const fetchUsers = async (isInitial = false) => {
        try {
            const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/admin/users?skip=${isInitial ? 0 : skip}&limit=${limit}`, {
                withCredentials: true,
            });
            setCurrentAdmin(res.data.userAdmin);
            let allUsers = isInitial ? res.data.users : [...users, ...res.data.users];
            allUsers = allUsers.filter(u => u._id !== userId);

            setUsers(allUsers);
            setSkip(isInitial ? limit : skip + limit);
            setHasMore(res.data.hasMore);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const deleteUser = async (id) => {
        if (!window.confirm("Ви впевненні що хочете назавжи видалити користувача ?")) return;
        try {
            await axios.delete(import.meta.env.VITE_SERVER_DOMAIN + `/admin/user/${id}`, { withCredentials: true });
            setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
            toast.info("Користувача було видалено")
        } catch (err) {
            console.error("Помилка видалення користувача", err);
        }
    };

    const toggleAdmin = async (id, isAdmin) => {
        try {
            await axios.patch(import.meta.env.VITE_SERVER_DOMAIN + `/admin/users/${id}`, {
                makeAdmin: !isAdmin
            }, { withCredentials: true });

            setUsers(prev =>
                prev.map(user =>
                    user._id === id
                        ? {
                            ...user,
                            personal_info: {
                                ...user.personal_info,
                                role: !isAdmin ? 'admin' : 'user'
                            }
                        }
                        : user
                )
            );
            toast.success("Роль користувача було змінено")

        } catch (err) {
            console.error(err);
        }
    };

    const toggleBlocked = async (id, isBlocked) => {
        try {
            await axios.patch(import.meta.env.VITE_SERVER_DOMAIN + `/admin/blocked/${id}`, { isBlocked: !isBlocked },
                { withCredentials: true });

            setUsers(prev =>
                prev.map(user =>
                    user._id === id
                        ? {
                            ...user,
                            isBlocked: !isBlocked
                        }
                        : user
                )
            );
            if (!isBlocked) {
                toast.info("Користувача було заблоковано")
            } else {
                toast.success("Користувача було розблоковано")

            }

        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.personal_info.fullname.toLowerCase().includes(query) ||
            user.personal_info.email.toLowerCase().includes(query) ||
            user._id.toLowerCase().includes(query)
        );
    });

    if (loading && users.length === 0) return null;

    return (
        <div className="users-admin-page">
            <div className="usa-title-container">
                <h3>Користувачі</h3>
                <input
                    type="text"
                    placeholder="Пошук за ім'ям, email або ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>


            {currentAdmin && (
                <div className="current-admin">
                    <strong>Адмін: {currentAdmin.personal_info.fullname}</strong> — {currentAdmin.personal_info.email}
                </div>
            )}

            <table className="users-table">
                <thead>
                    <tr>
                        <th>Ім’я</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            <td onClick={() => navigate(`/profile/${user._id}`)}>{user.personal_info.fullname}</td>
                            <td>{user.personal_info.email}</td>
                            <td>{user.personal_info.role}</td>
                            <td>
                                <button
                                    onClick={() => toggleAdmin(user._id, user.personal_info.role === 'admin')}
                                    className={user.personal_info.role === 'admin' ? 'admin-action active' : 'admin-action'}
                                >
                                    <span className="fi fi-rr-crown"></span>
                                </button>

                                <button
                                    onClick={() => toggleBlocked(user._id, user.isBlocked === true)}
                                    className={user.isBlocked ? 'admin-action blocked' : 'admin-action'}
                                >
                                    <span className="fi fi-rr-ban"></span>
                                </button>
                                <button
                                    onClick={() => deleteUser(user._id)}
                                    className="admin-action delete"
                                >
                                    <span className="fi fi-rr-trash"></span>
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {
                hasMore && (
                    <button className="load-more" onClick={() => fetchUsers()}>
                        Завантажити ще
                    </button>
                )
            }
        </div >
    );
};

export default UsersAdminPage;
