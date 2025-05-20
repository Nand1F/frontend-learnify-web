import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TeacherReviewPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { formatName } from "../common/formatName";
import defaultAvatar from '../assets/default-avatar.jpg';


const TeacherReviewPage = () => {
    const { id } = useParams()
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    const statusLabels = {
        awaiting: 'Призначено',
        submitted: 'Здано',
        graded: 'Оцінено',
        rejected: 'Повернуто',

    };
    const navigate = useNavigate()

    useEffect(() => {

        const getData = async () => {
            try {
                console.log(id)
                const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/answers/by-task/${id}`, { withCredentials: true });
                setAnswers(response.data)
                console.log(response.data)
            } catch (error) {
                if (error.response.status === 403 || error.response.status === 401) {
                    navigate('/403')
                } if (error.response.status === 404) {
                    navigate('/404')
                }
                console.error("Error fetching answers:", error)
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            // console.log(id)
            getData();
        }


    }, [id]);

    const handleGrade = async () => {
        const { _id, grade_info, feedback } = selectedAnswer;
        console.log(selectedAnswer)
        try {
            const response = await axios.put(import.meta.env.VITE_SERVER_DOMAIN + `/answers/grade/${_id}`,
                {
                    grade: grade_info.grade,
                    maxGrade: grade_info.maxGrade,
                    feedback,
                },
                { withCredentials: true }
            );
            // console.log(response.data)
            alert("Відповідь успішно оцінено");
            setAnswers((prevAnswers) =>
                prevAnswers.map((ans) =>
                    ans._id === _id
                        ? {
                            ...response.data,
                            studentId: ans.studentId,
                            fileIds: ans.fileIds,
                        }
                        : ans
                )
            );

            // Так само для selectedAnswer
            setSelectedAnswer({
                ...response.data,
                studentId: selectedAnswer.studentId,
                fileIds: selectedAnswer.fileIds,
            });
        } catch (err) {
            console.error("Grade error:", err);
        }
    };

    const handleReject = async () => {
        const { _id, feedback } = selectedAnswer;
        try {
            const response = await axios.put(import.meta.env.VITE_SERVER_DOMAIN + `/answers/reject/${_id}`,
                { feedback },
                { withCredentials: true }
            );
            // console.log(response)
            alert("Відповідь було відхило");
            setAnswers((prevAnswers) =>
                prevAnswers.map((ans) =>
                    ans._id === _id
                        ? {
                            ...response.data,
                            studentId: ans.studentId,
                            fileIds: ans.fileIds,
                        }
                        : ans
                )
            );

            // Так само для selectedAnswer
            setSelectedAnswer({
                ...response.data,
                studentId: selectedAnswer.studentId,
                fileIds: selectedAnswer.fileIds,
            });
        } catch (err) {
            console.error("Rejection error:", err);
        }
    };

    if (isLoading) return null;

    return (
        <div className="review-page">
            <div className="user-list">
                {answers.length === 0 || answers.every(ans => ans.status === "awaiting") ? (
                    <p className="no-answers-message">Ще немає відповідей</p>
                ) : (
                    answers.map((ans) => (
                        ans.status !== "awaiting" && (
                            <div
                                key={ans._id}
                                className={`user-item ${selectedAnswer?._id === ans._id ? "selected" : ""}`}
                                onClick={() => setSelectedAnswer(ans)}
                            >
                                <div className="tp-info-container">
                                    <img
                                        className="tp-avatar"
                                        src={ans.studentId.personal_info.profile_img || defaultAvatar}
                                        alt={`${ans.studentId.personal_info.fullname} avatar`}
                                    />
                                    <div className="tp-text-info">
                                        <p className="tp-fullname">{formatName(ans.studentId.personal_info.fullname)}</p>
                                        <p className={`tp-status ${ans.status}`}>{statusLabels[ans.status]}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>

            <div className="answer-details">
                {selectedAnswer ? (
                    <>
                        <h3>Файли до відповіді</h3>
                        <ul>
                            {selectedAnswer.fileIds && selectedAnswer.fileIds.length > 0 ? (
                                <ul>
                                    {selectedAnswer.fileIds.map((file) => (
                                        <li key={file._id}>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                {file.originalName}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-files-message">Без прикріплених файлів</p>
                            )}
                        </ul>
                        <div className="file-note">
                            <p className="tp-text-note">Файли доступні лише протягом 15 хвилин після відкриття сторінки.</p>
                            <p className="tp-text-note">Якщо вони не відкриваються, перезавантажте сторінку.</p>
                        </div>


                        <div className="grading-section">
                            <label>Оцінка:</label>
                            <div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={selectedAnswer.grade_info.grade ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setSelectedAnswer({
                                                ...selectedAnswer,
                                                grade_info: {
                                                    ...selectedAnswer.grade_info,
                                                    grade: value === "" ? "" : Number(value),
                                                },
                                            });
                                        }
                                    }}
                                />
                                <span> / </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={selectedAnswer.grade_info.maxGrade ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setSelectedAnswer({
                                                ...selectedAnswer,
                                                grade_info: {
                                                    ...selectedAnswer.grade_info,
                                                    maxGrade: value === "" ? "" : Number(value),
                                                },
                                            });
                                        }
                                    }}
                                />

                            </div>


                            <textarea
                                placeholder="Коментар викладача (не обов'язково)"
                                value={selectedAnswer.feedback || ""}
                                onChange={(e) =>
                                    setSelectedAnswer({ ...selectedAnswer, feedback: e.target.value })
                                }
                            ></textarea>

                            <div className="grading-buttons">
                                <button className="tp-grading-buttons" onClick={handleGrade}>{selectedAnswer.status !== "graded" ? "Оцінити" : "Оновити оцінку"}</button>
                                {selectedAnswer.status !== "rejected" && <button className="tp-rejected-buttons" onClick={handleReject}>Повернути відповідь </button>}

                            </div>
                        </div>
                    </>
                ) : (
                    <p>Виберіть користувача щоб подивитися на його відпоідь</p>
                )}
            </div>
        </div >
    );
};

export default TeacherReviewPage;
