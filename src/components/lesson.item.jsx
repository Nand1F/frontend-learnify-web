// import { FaTrash, FaChartBar } from "react-icons/fa";
import "../styles/lesson.item.css"
import { Link, useNavigate } from "react-router-dom";
import { formatedDate } from "../common/formattedDate";
import axios from "axios";

const LessonItem = ({ lesson, role, courseId }) => {
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (window.confirm("Ти впевнений, що хочеш видалити цей урок?")) {
            try {
                await axios.delete(import.meta.env.VITE_SERVER_DOMAIN + `/delete/lesson/${lesson._id}`,
                    { withCredentials: true });
                window.location.reload();
            } catch (error) {
                console.error(error)
            }

        }
    };


    return (
        <div className={`lesson-card ${lesson.type}`}>
            <Link
                className='cp-lesson-item-link'
                to={`/course/lesson/${lesson._id}`}
                key={lesson._id}
            >
                <div className="lesson-card-title">
                    <div className="lesson-type-icon">
                        {lesson.type === 'lesson' ? '📚' : '📝'}
                        <span className="lesson-type-text">
                            {lesson.type === 'lesson' ? 'Урок' : 'Завдання'}
                        </span>
                    </div>

                    <div className="lesson-content">
                        <h3>{lesson.title}</h3>
                        {lesson.createdAt && (
                            <p className="lesson-date">
                                Створено: {formatedDate(lesson.createdAt)}
                            </p>
                        )}
                    </div>
                </div></Link>


            {role === "teacher" && <div className="lesson-actions">

                {lesson.type === "task" && (
                    <Link to={`/course/${courseId}/lesson/${lesson._id}/stats`}>
                        <button className="lp-icon-button" title="Перевірити здачі">
                            <span className="fi fi-rr-stats icon"> </span>
                        </button>
                    </Link>

                )}

                <button className="lp-icon-button-delete" onClick={handleDelete} title="Видалити урок">
                    <span className="fi fi-rr-trash icon"> </span>

                </button>

            </div>}
        </div>
    );
};

export default LessonItem;

