import React from "react";
import { Link } from "react-router-dom";
import DefaultAvatar from "../assets/default-avatar.jpg";
import "../styles/CourseCard.css";
import { formatName } from "../common/formatName";

const CourseCard = ({ course }) => {
    return (
        <Link to={`/course/${course._id}`} className="mp-course-link">
            <div className="mp-course-card">
                <div className="mp-teacher-section">
                    <div className="mp-teacher-avatar-container">
                        <img
                            src={course.teacherId.personal_info.profile_img || DefaultAvatar}
                            alt="Teacher Avatar"
                            className="mp-teacher-avatar"
                        />
                    </div>
                    <div className="mp-teacher-info">
                        <p className="mp-teacher-label">👨‍🏫 Викладач</p>
                        <p className="mp-teacher-name">{formatName(course.teacherId.personal_info.fullname || "")}</p>
                    </div>
                </div>

                {/* ℹ️ Блок інформації про курс */}
                <div className="mp-course-info">
                    <h3 className="mp-card-title">{course.title}</h3>
                    <p className="mp-card-desc">{course.description}</p>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
