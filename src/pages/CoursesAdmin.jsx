import { useEffect, useState } from 'react';
import "../styles/UsersAdmin.css"
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';


const CoursesAdminPage = () => {
    const [courses, setCourses] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const limit = 2;
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses(true);
    }, []);

    const fetchCourses = async (isInitial = false) => {
        try {
            const res = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + `/admin/courses?skip=${isInitial ? 0 : skip}&limit=${limit}`,
                { withCredentials: true }
            );

            let allCourses = isInitial ? res.data.courses : [...courses, ...res.data.courses];

            setCourses(allCourses);
            console.log(allCourses)
            setSkip(isInitial ? limit : skip + limit);
            setHasMore(res.data.hasMore);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id) => {
        if (!window.confirm("Ви впевнені, що хочете назавжди видалити курс?")) return;
        try {
            await axios.delete(import.meta.env.VITE_SERVER_DOMAIN + `/admin/course/${id}`, {
                withCredentials: true
            });
            setCourses(prev => prev.filter(course => course._id !== id));
        } catch (err) {
            console.error("Помилка видалення курсу", err);
        }
    };

    const filteredCourses = courses.filter(course => {
        const query = searchQuery.toLowerCase();
        return (
            course.title.toLowerCase().includes(query) ||
            course._id.toLowerCase().includes(query) ||
            course.teacherId?.personal_info?.fullname?.toLowerCase().includes(query) ||
            course.teacherId?._id?.toLowerCase().includes(query)
        );
    });

    if (loading && courses.length === 0) return null;

    return (
        <div className="users-admin-page">
            <div className="usa-title-container">
                <h3>Курси</h3>
                <input
                    type="text"
                    placeholder="Пошук по назві, викладачу або ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <table className="users-table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Викладач</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map(course => (
                        <tr key={course._id}>
                            <td onClick={() => navigate(`/course/${course._id}`)} >{course.title}</td>
                            <td onClick={() => navigate(`/profile/${course.teacherId?._id}`)} >{course.teacherId?.personal_info?.fullname || "—"}</td>
                            <td>
                                <button
                                    onClick={() => deleteCourse(course._id)}
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
                    <button className="load-more" onClick={() => fetchCourses()}>
                        Завантажити ще
                    </button>
                )
            }
        </div >
    );
};

export default CoursesAdminPage;

