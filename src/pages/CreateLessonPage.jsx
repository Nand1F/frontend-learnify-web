import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateLessonPage.css";
import { toast } from "react-toastify";

export default function CreateLessonPage() {
    const courseId = useParams();
    const navigate = useNavigate();

    const [lessonData, setLessonData] = useState({
        type: "lesson",
        title: "",
        description: "",
        youtubeLink: "",
        deadline: "",
    });

    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});


    const validate = () => {
        const newErrors = {};

        if (!lessonData.title.trim()) {
            newErrors.title = "Назва є обов'язковою.";
        }

        if (!lessonData.description.trim()) {
            newErrors.description = "Опис є обов'язковим.";
        }

        if (lessonData.type === "task" && !lessonData.deadline) {
            newErrors.deadline = "Дедлайн обов'язковий для завдань.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            console.log(courseId.id)
            const formData = new FormData();
            formData.append("type", lessonData.type);
            formData.append("title", lessonData.title);
            formData.append("description", lessonData.description);
            formData.append("youtubeLink", lessonData.youtubeLink);
            if (lessonData.type === "task") {
                console.log(lessonData.deadline)
                formData.append("deadline", lessonData.deadline);
            }

            // Додаємо файли, якщо обрано "урок"
            if (lessonData.type === "lesson" && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append("files", files[i]);
                }
            }

            await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/lessons/create/${courseId.id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success(`${lessonData.type === "task" ? "Завдання" : "Урок"} створено`)
            navigate(`/course/${courseId.id}`);
        } catch (err) {
            console.error(err);
            toast.error("Помилка при створенні уроку.");
        }
    };

    return (
        <div className="clp-container">
            <h1>Створення {lessonData.type === "lesson" ? "уроку" : "завдання"}</h1>

            <div className="clp-scroll-fields">
                <div className="clp-field">
                    <label>Тип:</label>
                    <select
                        value={lessonData.type}
                        onChange={(e) =>
                            setLessonData({ ...lessonData, type: e.target.value })
                        }
                    >
                        <option value="lesson">Урок</option>
                        <option value="task">Завдання</option>
                    </select>
                </div>

                <div className="clp-field">
                    <label>Назва:</label>
                    <input
                        type="text"
                        value={lessonData.title}
                        onChange={(e) =>
                            setLessonData({ ...lessonData, title: e.target.value })
                        }
                    />
                    {errors.title && <div className="clp-error">{errors.title}</div>}
                </div>

                <div className="clp-field">
                    <label>Опис:</label>
                    <textarea
                        value={lessonData.description}
                        onChange={(e) =>
                            setLessonData({ ...lessonData, description: e.target.value })
                        }
                    />
                    {errors.description && <div className="clp-error">{errors.description}</div>}
                </div>

                <div className="clp-field">
                    <label>YouTube посилання (опціонально):</label>
                    <input
                        type="url"
                        value={lessonData.youtubeLink}
                        onChange={(e) =>
                            setLessonData({ ...lessonData, youtubeLink: e.target.value })
                        }
                    />
                </div>

                {lessonData.type === "task" && (
                    <div className="clp-field">
                        <label>Дедлайн:</label>
                        <input
                            type="datetime-local"
                            value={lessonData.deadline}
                            onChange={(e) =>
                                setLessonData({ ...lessonData, deadline: e.target.value })
                            }
                        />
                        {errors.deadline && <div className="clp-error">{errors.deadline}</div>}
                    </div>
                )}

                {lessonData.type === "lesson" && (
                    <div className="clp-field">
                        <label>Додати файли (опціонально):</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles([...e.target.files])}
                        />
                        {files.length > 0 && (
                            <ul className="file-list">
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <button className="clp-submit" onClick={handleSubmit}>
                Створити
            </button>
        </div>
    );
}
