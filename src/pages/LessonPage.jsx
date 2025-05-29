import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/LessonPage.css"
import { formatedDate } from "../common/formattedDate";
import { formatName } from "../common/formatName";
import defaultAvatar from '../assets/default-avatar.jpg';
import { toast } from "react-toastify";

const LessonPage = () => {
    const { id } = useParams();
    const [lesson, setLesson] = useState(null);
    const [answer, setAnswer] = useState({
        status: "submitted",
        grade_info: {
            grade: 0,
            maxGrade: 100
        }
    });
    const statusLabels = {
        awaiting: 'Призначено',
        submitted: 'Здано',
        graded: 'Оцінено',
        rejected: 'Повернуто',
    };

    const [files, setFiles] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const [userRole, setUserRole] = useState({
        role: "user"
    });
    const [teacherInfo, setTeacherInfo] = useState(null);

    const [editedLesson, setEditedLesson] = useState({ title: '', content: '', videoUrl: '', deadline: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const MAX_FILE_SIZE_MB = 25;

    const navigate = useNavigate();

    const getYouTubeEmbedUrl = (url) => {
        const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/course/lesson/${id}`,
                    {},
                    { withCredentials: true });

                setTeacherInfo(res.data.teacherInfo)
                setLesson(res.data.lesson);

                setEditedLesson({
                    title: res.data.lesson.title,
                    content: res.data.lesson.content,
                    videoUrl: res.data.lesson.videoUrl,
                    deadline: res.data.lesson.deadline ? formatToInputDateTime(res.data.lesson.deadline) : ''
                });
                setUserRole({ role: res.data.userRole });

            } catch (err) {
                const status = err.response?.status;
                if (status === 404) navigate("/404");
                else if (status === 403) navigate("/403");
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    useEffect(() => {
        const fetchAttachedFiles = async () => {
            try {
                const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/pull/files/${id}`,
                    { lessonType: lesson.type },
                    { withCredentials: true });
                setAttachedFiles(res.data);
            } catch (err) {
                console.error("Помилка отримання файлів:", err);
            }
        };

        const fetchAnswer = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/answer/my/${id}`, {
                    withCredentials: true
                });
                setAnswer(res.data);
            } catch (err) {
                setAnswer({ status: "awaiting" })
            }
        };

        if (lesson) {
            fetchAttachedFiles();
            if (lesson.type === "task") fetchAnswer();
        }
    }, [lesson]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (oversizedFiles.length > 0) return toast.error(`Файл(и) перевищують ${MAX_FILE_SIZE_MB}MB.`);
        setFiles(selectedFiles);
    };

    const handleSubmit = async () => {
        if (files.length === 0) return toast.error("Оберіть файл для надсилання.");
        if (answer?.status === "graded") return toast.error("Відповідь вже оцінено. Повторна здача недоступна.");

        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        formData.append("lessonId", lesson._id);

        try {
            setSubmitting(true);
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/download/answerFile/${id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFiles([]);
            window.location.reload();
            toast.success("Файл(и) було закріплено")
        } catch (err) {
            console.error("Помилка надсилання:", err);
            toast.error("Не вдалося закріпити файли.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            await axios.delete(import.meta.env.VITE_SERVER_DOMAIN + `/delete/answerFile/${fileId}`);
            setAttachedFiles((prev) => prev.filter(f => f._id !== fileId));
            toast.success("Файл було видалено")
        } catch (err) {
            toast.error("Не вдалося видалити файл");
        }
    };

    const updateAnswerStatus = async () => {
        if (!answer || answer.status === "graded") return;
        const newStatus = answer.status === "submitted" ? "awaiting" : "submitted";
        try {
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/answer/my/${id}/status/update`, { newStatus }, { withCredentials: true });
            setAnswer(prev => ({ ...prev, status: newStatus }));
            if (newStatus === "awaiting") {
                toast.info("Завдання було повернуто")
            } else {
                toast.success("Завдання здано")
            }
        } catch (error) {
            console.error("Помилка зміни статусу:", error);
            toast.error("Не вдалося змінити статус відповіді.");
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await axios.put(import.meta.env.VITE_SERVER_DOMAIN + `/lesson/edit/${id}`, {
                title: editedLesson.title,
                content: editedLesson.content,
                urlVideo: editedLesson.videoUrl,
                deadline: editedLesson.deadline
            },
                { withCredentials: true });
            toast.success("Сторінку оновлено")

        } catch (err) {
            console.error(err)
            toast.error("Не вдалося оновити сторінку");
        } finally {
            setLesson(prev => ({ ...prev, ...editedLesson }));
            setIsEditing(false);
        }

    };

    const formatToInputDateTime = (isoString) => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };

    if (loading) return <p>Завантаження...</p>;
    if (!lesson) return <p>Урок не знайдено.</p>;

    return (
        <div className="lp-lesson-page">
            <div className="lp-lesson-card">
                <div className="lp-scroll-box">
                    {userRole.role === "teacher" && !isEditing && (
                        <button className="edit-lesson-btn" onClick={() => setIsEditing(true)}>
                            ✏️ Редагувати {lesson.type === "task" ? "завдання" : "урок"}
                        </button>
                    )}


                    {!isEditing ? (
                        <>
                            <div className="lp-title-container">
                                <h1 className="lp-lesson-title">{lesson.title}</h1>
                                {lesson.deadline && (
                                    <div className="lp-task-status">
                                        <div className="lp-status-container">
                                            <p>Статус: </p>
                                            <p className={`lp-status ${answer?.status}`}>{statusLabels[answer?.status] || "Призначено"}</p>
                                        </div>
                                        <p className="lp-deadline">Виконати до: {formatedDate(lesson.deadline)}</p>
                                    </div>
                                )}
                            </div>
                            <p className="lp-lesson-description">{lesson.description}</p>

                            {answer?.grade_info && answer?.status === "graded" && (
                                <p>Оцінка: {answer.grade_info.grade} / {answer.grade_info.maxGrade}</p>
                            )}

                            {answer?.feedback && (
                                <div className="teacher-feedback-wrapper">
                                    <h3 className="feedback-title">Коментар від викладача</h3>
                                    <div className="teacher-feedback">
                                        <img className="teacher-avatar" src={teacherInfo?.personal_info?.profile_img || defaultAvatar} alt="Teacher avatar" />
                                        <div className="feedback-content">
                                            <p className="teacher-name">{teacherInfo?.personal_info?.fullname ? formatName(teacherInfo.personal_info.fullname) : "Невідомий викладач"}</p>
                                            <p className="feedback-text">“{answer.feedback || "Коментар відсутній"}”</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="lp-lesson-content">{lesson.content}</div>

                            {lesson.videoUrl && getYouTubeEmbedUrl(lesson.videoUrl) && (
                                <div className="lp-lesson-video">
                                    <iframe
                                        src={getYouTubeEmbedUrl(lesson.videoUrl)}
                                        title="YouTube video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {lesson.type === "task" && (
                                <>

                                    <div className="lp-task-section">
                                        <h3>📤 Закріпити файли</h3>

                                        {answer?.status === "graded" ? (
                                            <p>Ваша відповідь вже оцінена. Повторна здача недоступна.</p>
                                        ) : (
                                            <>
                                                <div className="lp-task-box">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="lp-task-file-input"
                                                        disabled={answer.status === "graded" || answer.status === "submitted"}
                                                    />
                                                    <button
                                                        disabled={submitting || files.length === 0 || answer.status === "graded" || answer.status === "submitted"}
                                                        onClick={handleSubmit}
                                                        className="lp-task-submit-btn"
                                                    >
                                                        {submitting ? "Надсилання..." : "Закріпити"}
                                                    </button>
                                                </div>

                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="lp-lesson-attachments">
                                {lesson.type === "task" ? <h3> 📎 Закріпленні файли з відповідю </h3> : <h3> 📎 Закріплені файли </h3>}
                                {attachedFiles.length === 0 ? (
                                    <div className="lp-lesson-files-placeholder">Наразі файли відсутні.</div>
                                ) : (
                                    attachedFiles.map(file => (
                                        <div key={file._id} className="lp-file-item">
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="lp-file-name">
                                                {file.originalName}
                                            </a>
                                            {lesson.type === "lesson" ? (
                                                userRole.role === "teacher" && (
                                                    <button className="lp-delete-btn" onClick={() => handleFileDelete(file._id)}>
                                                        🗑
                                                    </button>
                                                )
                                            ) : (
                                                answer.status !== "graded" && answer.status !== "submitted" && (
                                                    <button className="lp-delete-btn" onClick={() => handleFileDelete(file._id)}>
                                                        🗑
                                                    </button>
                                                )
                                            )}

                                        </div>
                                    ))
                                )}
                            </div>
                            {lesson?.type === "task" && (
                                <div className="lp-status-button">
                                    <button
                                        onClick={updateAnswerStatus}
                                        disabled={answer.status === "graded"}
                                    >
                                        {answer.status === "graded"
                                            ? "Вже оцінено"
                                            : answer.status === "submitted"
                                                ? "Скасувати надсилання"
                                                : "Здати"}
                                    </button>
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="lesson-edit-form">
                            <label>Назва:
                                <input type="text" value={editedLesson.title} onChange={e => setEditedLesson({ ...editedLesson, title: e.target.value })} />
                            </label>
                            <label>Опис:
                                <textarea value={editedLesson.content} onChange={e => setEditedLesson({ ...editedLesson, content: e.target.value })} />
                            </label>
                            <label>Посилання на відео:
                                <input type="text" value={editedLesson.videoUrl} onChange={e => setEditedLesson({ ...editedLesson, videoUrl: e.target.value })} />
                            </label>
                            {lesson.type === 'task' && (

                                <label>Дедлайн:
                                    <input type="datetime-local" value={editedLesson.deadline} onChange={e => setEditedLesson({ ...editedLesson, deadline: e.target.value })} />
                                </label>
                            )}
                            <button onClick={handleSaveEdit}>Зберегти</button>
                            <button onClick={() => setIsEditing(false)}>Скасувати</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPage;

