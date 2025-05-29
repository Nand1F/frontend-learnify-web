
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/navbar.component.css"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import defaultAvatar from '../assets/default-avatar.jpg';
import bell from "../assets/bell.png"
import bell_alt from "../assets/bell_alt.png"
import axios from "axios";
import { useRef } from "react";
import { use } from "react";

const Navbar = () => {
    const [hasUnread, setHasUnread] = useState(false);
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const menuRef = useRef(null);
    const { userAuth: { access_token, user }, setUserAuth } = useContext(UserContext);
    const navigate = useNavigate();

    const logout = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/logout', {}, {
            withCredentials: true
        })
            .then(() => {
                setUserAuth({ access_token: null, user: null });
                navigate("/")
            });
    };

    useEffect(() => {
        if (!access_token) return;

        const checkUnread = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/notifications/unread-count', {
                    withCredentials: true
                });
                setHasUnread(res.data.unreadCount > 0);
            } catch (err) {
                console.error("Failed to check unread notifications", err);
            }
        };

        checkUnread();
    }, [access_token]);

    // Закриття меню при кліку поза межами
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpenMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="nav-container">
                <Link to="/" className="link-logo">
                    <div className="nav-title">Learnify</div>
                </Link>

                {access_token ? (
                    <div className="nav-icons">
                        <Link
                            onClick={() => setHasUnread(false)}
                            to="/notification"
                            className="link-notification"
                        >
                            <img className="nv_img_bell" src={hasUnread ? bell_alt : bell} alt="bell" />
                        </Link>

                        <div className="avatar-wrapper" ref={menuRef}>
                            <img
                                className="avatar"
                                src={user.profile_img || defaultAvatar}
                                onClick={() => setIsOpenMenu(!isOpenMenu)}
                            />
                            {isOpenMenu && (
                                <div className="dropdown-menu">
                                    <Link to={`/profile/${user.user_id}`} onClick={() => setIsOpenMenu(false)}>Профіль</Link>
                                    <Link to={`/`} onClick={() => setIsOpenMenu(false)}>Курси</Link>

                                    {user.role === "admin" && <Link to="/admin" onClick={() => setIsOpenMenu(false)}>Адмін панель</Link>}
                                    <button onClick={logout}>Вийти</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="nav-icons"></div>
                )}
            </nav>
            <Outlet />
        </>
    );
};

export default Navbar;
