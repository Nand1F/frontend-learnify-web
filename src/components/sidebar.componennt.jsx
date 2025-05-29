import { Link, Outlet } from "react-router-dom";
import '../styles/sidebar.component.css';
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios";

const SideBar = () => {
    const [courses, setCourses] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const sidebarRef = useRef(null);

    const { userAuth: { access_token } } = useContext(UserContext);

    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-courses", {}, {
                    withCredentials: true
                });
                setCourses(res.data.courses);
            } catch (error) {
                console.error('Помилка при отриманні курсів:', error);
            }
        };

        fetchUserCourses();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden"; // блокує скролл фону
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.body.style.overflow = "auto";
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.body.style.overflow = "auto";
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    return (
        <div style={{ display: "flex" }}>
            {access_token && (
                <>
                    <button
                        className="burger-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="fi fi-sr-menu-burger sd-menu-icon"></span>
                    </button>

                    {isMobileMenuOpen && <div className="overlay"></div>}

                    <aside
                        className={`mp-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
                        ref={sidebarRef}
                    >
                        <div>
                            <p className="mp-menu-title">Список курсів</p>
                            <div className="mp-scrollable-element">
                                {courses.length > 0 ? (
                                    <ul className="mp-course-menu">
                                        {courses.map(course => (
                                            <Link
                                                key={course._id}
                                                to={`/course/${course._id}`}
                                                className="mp-course-link"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <li className="mp-menu-item">{course.title}</li>
                                            </Link>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mp-no-courses">
                                        <span className="mp-no-courses-icon">📭</span>
                                        <p className="mp-no-courses-text">Немає доступних курсів</p>
                                        <p className="mp-no-courses-subtext">Приєднайся до курсу або створи власний!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                </>
            )}

            <div className="sd-outlet">
                <Outlet />
            </div>
        </div>
    );
};

export default SideBar;
