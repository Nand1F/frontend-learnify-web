
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LessonItem from '../components/lesson.item';
import '../styles/CoursePage.css';


const CourseContent = ({ courseData, userRole }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="cp-course-content">
            <div className='cp-lessons-title'>
                <h2>Уроки та завдання</h2>
                {userRole.role === "teacher" && (
                    <div className="cp-add-lesson-btn-container">
                        <button
                            className="cp-add-lesson-btn"
                            onClick={() => navigate(`/course/${id}/create-lesson`)}
                        >
                            Створити
                        </button>
                    </div>
                )}
            </div>

            <div className="cp-lessons-list-container">
                <div className="cp-lessons-list-scroll">
                    {!Array.isArray(courseData?.lessonsId) || courseData?.lessonsId?.length === 0 ? (
                        <p className="cp-no-lessons">Поки що уроки та завдання відсутні!</p>
                    ) : (
                        courseData.lessonsId.map(lesson => (

                            <LessonItem key={lesson._id} className="lesson-item" lesson={lesson} role={userRole.role} />

                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseContent;
