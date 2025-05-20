import { useState } from "react";
import "../styles/CourseTabs.css";
import defoultAvatar from '../assets/default-avatar.jpg'
import axios from "axios";
import { formatName } from "../common/formatName";

export default function CourseInfo({ courseData, userRole }) {
    const [inviteCode, setInviteCode] = useState(courseData?.inviteCode || "");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const handleGenerate = async () => {
        if (cooldown > 0) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_DOMAIN}/courses/${courseData._id}/invite-code/generate`,
                { withCredentials: true }
            );
            setInviteCode(response.data);
            startCooldown();
        } catch (error) {
            alert("Не вдалося згенерувати код");
        }
    };

    const startCooldown = () => {
        setCooldown(15);
        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            alert("Не вдалося скопіювати код");
        }
    }

    const createdDate = new Date(courseData.joinedAt).toLocaleString("uk-UA");

    return (
        <div className="course-info">
            <h2>Інформація про курс</h2>
            <p><strong>Назва:</strong> {courseData.title}</p>
            <p><strong>Опис:</strong> {courseData.description}</p>
            <p><strong>Створено:</strong> {createdDate}</p>

            <h3>Викладач</h3>
            <div className="person-card">
                <div className="ci-porson-info-container">
                    <img src={courseData.teacherId?.personal_info?.profile_img || defoultAvatar} alt="avatar" className="ci-img-avatar" />
                    <div className="person-info">
                        <p>{formatName(courseData.teacherId?.personal_info?.fullname) || "Помилка завантаження даних !"}</p>
                        <p>{courseData.teacherId?.personal_info?.email || "Помилка завантаження даних !"}</p>
                    </div>
                </div>
                <a href={`mailto:${courseData.teacherId?.personal_info?.email}`} className="ci-link-email" >
                    <span className="fi fi-rr-envelope icon"></span>
                </a>

            </div>

            {userRole.role === "teacher" && (
                <div className="invite-code-box">
                    <div className="ci-invate-code-container">
                        <div>
                            <label>Код запрошення:</label>
                            <span
                                className="ci-invite-code"
                                onClick={handleCopy}

                            >
                                {inviteCode}
                                {copied && <span className="tooltip">Скопійовано!</span>}
                            </span>
                        </div>

                        <button
                            className="ci-button-generate-code"
                            onClick={handleGenerate}
                            disabled={cooldown > 0}
                        >
                            {cooldown > 0 ? `Повторити через ${cooldown} с` : "Згенерувати новий код"}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}