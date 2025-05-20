import React, { useContext, useEffect, useState } from 'react';
import '../styles/MainPage.css';
import DefaultAvatar from "../assets/default-avatar.jpg"
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import WelcomePage from './WelcomePage';
import CourseCard from '../components/course.card';

const MainPage = () => {
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('join');
    const [joinCode, setJoinCode] = useState('');
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: ''
    });
    let {
        userAuth: { access_token },
        setUserAuth,
    } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {

        const fetchUserCourses = async () => {
            try {
                await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-courses", {}, {
                    withCredentials: true
                })
                    .then(({ data }) => {
                        // Виводимо в консоль
                        console.log("Отримані курси:", data.courses);
                        setCourses(data.courses)
                    })
                    .catch((res) => {
                        console.log("Помилка при отримані курсів:" + res);
                    })


            } catch (error) {
                console.error('Помилка при отриманні курсів:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserCourses();
    }, []);



    const handleJoinCourse = async () => {
        try {
            if (!joinCode) {
                return alert("Спочатку ведіть запрошувальний код курсу !")
            }
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/course/join/${joinCode}`,
                {},
                { withCredentials: true }
            );

            console.log("Приєднано до курсу:", data);
            setCourses(prev => [...prev, data.course]); // Додаємо новий курс
        } catch (error) {
            alert(error.response?.data?.message || error.message)
            console.error("Помилка приєднання:", error.response?.data?.message || error.message);
        }

        setIsModalOpen(false);
        setJoinCode('');
    };



    const handleCreateCourse = async () => {
        try {
            if (!newCourse.title || !newCourse.description) {
                return alert("Заповніть всі поля!");
            }
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/course/create",
                newCourse,
                { withCredentials: true }
            );

            console.log("Курс створено:", data);
            setCourses(prev => [...prev, data.course]); // Додаємо новий курс
        } catch (error) {
            console.error("Помилка створення курсу:", error.response?.data?.message || error.message);
        }

        setIsModalOpen(false);
        setNewCourse({ title: '', description: '' });
    };

    if (isLoading) return null;

    return access_token ? (
        <main className="mp-main">
            <h2 className="mp-main-title">Доступні курси</h2>
            <div className='mp-scrollable-element-main'>
                <div className="mp-course-grid">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            </div>


            <button
                className="mp-add-button"
                onClick={() => setIsModalOpen(true)}
            >
                <span className='fi fi-rr-plus-small icon' ></span>
            </button>

            {/* Модальне вікно */}
            {isModalOpen && (
                <div className="mp-modal-overlay">
                    <div className="mp-modal">
                        <div className="mp-modal-tabs">
                            <button
                                className={`mp-tab ${activeTab === 'join' ? 'active' : ''}`}
                                onClick={() => setActiveTab('join')}
                            >
                                Приєднатися
                            </button>
                            <button
                                className={`mp-tab ${activeTab === 'create' ? 'active' : ''}`}
                                onClick={() => setActiveTab('create')}
                            >
                                Створити
                            </button>
                        </div>

                        <div className="mp-modal-content">
                            {activeTab === 'join' ? (
                                <div className="mp-join-tab">
                                    <input
                                        type="text"
                                        placeholder="Код курсу"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        className="mp-input"
                                    />
                                    <div className="mp-invite-info-wrapper">
                                        <h3 className="mp-info-title">Про код запрошення</h3>
                                        <p className="mp-info-text">
                                            Код запрошення до курсу складається з 24 символів та є унікальним для кожного курсу.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleJoinCourse}
                                        className="mp-submit-button"
                                    >
                                        Приєднатися
                                    </button>
                                </div>
                            ) : (
                                <div className="mp-create-tab">
                                    <input
                                        type="text"
                                        placeholder="Назва курсу"
                                        value={newCourse.title}
                                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                        className="mp-input"
                                    />
                                    <textarea
                                        placeholder="Опис курсу"
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="mp-textarea"
                                    />
                                    <button
                                        onClick={handleCreateCourse}
                                        className="mp-submit-button"
                                    >
                                        Створити курс
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="mp-close-button"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </main>

    ) : (<WelcomePage></WelcomePage>);
};


export default MainPage;
