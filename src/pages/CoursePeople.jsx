import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/CourseTabs.css";
import { formatName } from "../common/formatName";
import defaultAvatar from '../assets/default-avatar.jpg';


const CoursePeople = ({ courseId }) => {
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/courses/${courseId}/people`,
                    { withCredentials: true }
                );
                // console.log(res.data.students);
                setTeacher(res.data.teacher);
                setStudents(res.data.students);
            } catch (error) {
                console.error("Помилка при завантаженні користувачів курсу:", error);
            }
        };

        fetchPeople();
    }, [courseId]);

    const deleteUser = async (studentId) => {
        // console.log(studentId)
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_SERVER_DOMAIN}/courses/${courseId}/people/${studentId}/delete`,
                { withCredentials: true }
            );
            console.log(res.data);
            setStudents((prev) => prev.filter((student) => student._id !== studentId));

        } catch (error) {
            console.error("Помилка при видалені користувача з курсу:", error);
        }
    }

    return (
        <div className="course-people">
            <h2>Викладач</h2>
            {teacher && (
                <div className="person-card">
                    <div className="ci-porson-info-container">
                        <img src={teacher?.personal_info?.profile_img || defaultAvatar} alt="avatar" className="ci-img-avatar" />
                        <div className="person-info">
                            <p>{formatName(teacher?.personal_info?.fullname) || "Помилка завантаження даних !"}</p>
                            <p>{teacher?.personal_info?.email || "Помилка завантаження даних !"}</p>
                        </div>
                    </div>
                    <a href={`mailto:${teacher?.personal_info?.email}`} className="ci-link-email" >
                        <span className="fi fi-rr-envelope icon"></span>
                    </a>

                </div>
            )}

            <h2>Учасники курсу</h2>
            <div className="students-list">
                {students.length === 0 ? (
                    <p className="no-students-message">Поки що жоден студент не приєднався до курсу.</p>
                ) : (
                    students.map((student) => (
                        <div className="person-card" key={student._id}>
                            <div className="ci-porson-info-container">
                                <img src={student?.personal_info?.profile_img || defaultAvatar} alt="avatar" className="ci-img-avatar" />
                                <div className="person-info">
                                    <p>{formatName(student?.personal_info?.fullname) || "Помилка завантаження даних !"}</p>
                                    <p>{student?.personal_info?.email || "Помилка завантаження даних !"}</p>
                                </div>
                            </div>
                            <div className="ci-porson-icon-container">
                                <a href={`mailto:${student?.personal_info?.email}`} className="ci-link-email">
                                    <span className="fi fi-rr-envelope icon"></span>
                                </a>
                                <a onClick={() => deleteUser(student._id)} className="ci-link-trash">
                                    <span className="fi fi-rr-trash icon"></span>
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div >
    );
}
export default CoursePeople;