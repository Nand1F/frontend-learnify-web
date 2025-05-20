import React, { useEffect, useState } from 'react';
import '../styles/CoursePage.css';
import LessonItem from '../components/lesson.item';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CourseContent from './CourseContent';
import CoursePeople from './CoursePeople';
import CourseInfo from './CourseInfo';

const CoursePage = () => {

    const { id } = useParams(); // Отримуємо ID курсу з URL
    const [courseData, setCourseData] = useState(null);
    const [userRole, setUserRole] = useState({
        role: "user"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ status: null });
    const [activeTab, setActiveTab] = useState('lessons');

    const navigate = useNavigate()

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);

                const response = await axios.post(
                    import.meta.env.VITE_SERVER_DOMAIN + `/course/lessons/${id}`,
                    {},
                    { withCredentials: true }
                );
                // console.log(response)

                setCourseData(response.data.course);
                setUserRole({ role: response.data.userRole })
                setError(null);
            } catch (err) {
                const status = err.response?.status || 500;

                if (status === 404) {
                    navigate("/404");
                } if (status === 403) {
                    navigate("/403")
                } else {
                    navigate("/")
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseData();
        }
        return (setActiveTab("lessons"))
    }, [id, navigate]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };



    if (loading || error) return null;


    return (

        <div className="cp-course-page">
            <header className="cp-course-header">
                <h1>{courseData?.title || 'Без назви'}</h1>
                <p className="cp-course-description">{courseData?.description || 'Опис відсутній'}</p>
                <div className='cp-top-menu'>
                    <button
                        className={`cp-button-mune ${activeTab === 'lessons' ? 'active' : ''}`}
                        onClick={() => handleTabChange('lessons')}
                    >
                        Уроки та завдання
                    </button>

                    {userRole.role === 'teacher' && (
                        <button
                            className={`cp-button-mune ${activeTab === 'people' ? 'active' : ''}`}
                            onClick={() => handleTabChange('people')}
                        >
                            Люди
                        </button>
                    )}

                    <button
                        className={`cp-button-mune ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => handleTabChange('info')}
                    >
                        Інформація
                    </button>
                </div>
            </header>

            {/* Відображаємо активний компонент */}
            {activeTab === 'lessons' && (
                <CourseContent
                    courseData={courseData || { lessonsId: [] }}
                    userRole={userRole || 'user'}
                />
            )}

            {activeTab === 'people' && userRole.role === 'teacher' && (
                <CoursePeople courseId={id} />
            )}

            {activeTab === 'info' && (
                <CourseInfo courseData={courseData} userRole={userRole} />
            )}
        </div>
    );
};

export default CoursePage;