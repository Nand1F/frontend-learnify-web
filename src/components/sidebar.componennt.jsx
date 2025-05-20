
import { Link, Outlet } from "react-router-dom";
import logo from "../imgs/logo.png";
import '../styles/sidebar.component.css';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import defaultAvatar from '../assets/default-avatar.jpg';
import axios from "axios";

const SideBar = () => {

    const [courses, setCourses] = useState([]);
    let {
        userAuth: { access_token },
        setUserAuth,
    } = useContext(UserContext);

    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-courses", {}, {
                    withCredentials: true
                })
                    .then(({ data }) => {
                        // Виводимо в консоль
                        // console.log("Отримані курси:", data.courses);
                        setCourses(data.courses)
                    })
                    .catch((res) => {
                        console.log("Помилка при отримані курсів:" + res);
                    })


            } catch (error) {
                console.error('Помилка при отриманні курсів:', error);
            }
        };

        fetchUserCourses();
    }, []);
    return access_token ? (
        <div style={{ display: "flex" }}>
            <aside className="mp-sidebar">
                <div>
                    <p className="mp-menu-title">Список курсів</p>
                    <div className="mp-scrollable-element">
                        <ul className="mp-course-menu">
                            {courses.map(course => (
                                <Link
                                    key={course._id}
                                    to={`/course/${course._id}`}
                                    className="mp-course-link"
                                >
                                    <li className="mp-menu-item">{course.title}</li>
                                </Link>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mp-menu-bottom">
                    <p className="mp-menu-bottom-line"></p>
                    <button className="mp-settings-btn">⚙️ Settings</button>
                </div>
            </aside>

            <div className="sd-outlet">
                <Outlet />
            </div>
        </div>
    ) : (<>
        <div className="sd-outlet">
            <Outlet />
        </div></>);
}

export default SideBar;