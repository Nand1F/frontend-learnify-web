import { useParams } from "react-router-dom";
import defaultAvatar from '../assets/default-avatar.jpg';
import googleIcon from '../assets/google.png';
import "../styles/ProfilePage.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatName } from "../common/formatName";
import { toast } from "react-toastify";



const ProfilePage = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [ownPage, setOwnPage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editInfo, setEditInfo] = useState({});
    const [changePassword, setChangePassword] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '' });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/profile/get/${id}`, { withCredentials: true })
                setUser(response.data.userData);
                setEditInfo(response.data.userData.personal_info);
                setOwnPage(response.data.ownPage);
                console.log(response.data.userData)
            } catch (error) {
                console.log(error)
                toast.error("Трапилася помилка під час заванатження профілю")
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchdata();
    }, [id]);

    useEffect(() => {
        setError("")
    }, [changePassword])

    const handleImageClick = () => {
        document.getElementById("fileInput").click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and GIF files are allowed.');
            return;
        }

        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert('File must be less than 10MB.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/profile/upload-avatar', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res)

            setUser((prev) => ({
                ...prev,
                personal_info: {
                    ...prev.personal_info,
                    profile_img: res.data.url
                },
                user_avatar_type: "custom"
            }));
            toast.success("Аватар було оновлено")
        } catch (err) {
            console.error(err);
            toast.error("Трапилася помилка під час оновлення автару");
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(import.meta.env.VITE_SERVER_DOMAIN + `/profile/update/${id}`, { personal_info: editInfo }, { withCredentials: true });
            setUser((prev) => ({ ...prev, personal_info: editInfo }));
            setIsEditing(false);
            toast.success("Профіль було оновлено")
        } catch (err) {
            console.log(err);
            toast.error("Трапилася помилка під час оновлення профілю");
        }
    };

    const updatePassword = async () => {
        if (passwords.new === "" || passwords.old === "") {
            return setError("Спочатку заповність всі поля")
        }
        try {
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/profile/update-password/${id}`, { passwords }, { withCredentials: true });
            toast.success("Пароль було оновлено");
            setChangePassword(false);
            setPasswords({ old: '', new: '' })
        } catch (err) {
            console.log(err)
            if (err.response.status === 400) {
                setError("Новий пароль має містити від 6 до 20 символів з числом, 1 малою та 1 великою літерами")
            } else if (err.response.status === 409) {
                setError("Введено не правильний пароль !")
            } else {
                toast.error("Трапилася помилка під час оновлення паролю")
            }
        }
    };

    const updateAvatarType = async (type) => {
        try {
            const response = await axios.put(import.meta.env.VITE_SERVER_DOMAIN + `/user/avatar-type/${id}`,
                { type },
                {
                    withCredentials: true
                }
            );
            console.log(response)

            setUser((prev) => ({
                ...prev,
                personal_info: {
                    ...prev.personal_info,
                    profile_img: type === "default" ? "" :
                        type === "google" && response.data.profile_img
                },
                user_avatar_type: type
            }));
            toast.success("Аватар було оновлено")
        } catch (err) {
            console.error("Помилка при оновленні типу аватарки:", err.response?.data || err.message);
            toast.error("Трапилася помилка при оновленні типу аватарки")
        }
    };

    if (isLoading || !user) return null;

    return (
        <div className="profile-container">
            <h2>Профіль користувача</h2>
            <div className="profile-card">
                <div className="avatar-section">
                    {ownPage && (
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    )}
                    <img
                        className="profile-avatar"
                        id="avatar-img"
                        src={user.personal_info.profile_img ? user.personal_info.profile_img : defaultAvatar}
                        alt="avatar"
                        onClick={ownPage ? handleImageClick : undefined}
                        style={{ cursor: ownPage ? "pointer" : "default" }}
                    />
                    {ownPage && (
                        <div className="avatar-buttons">
                            {user.google_auth && user.user_avatar_type !== "google" && (
                                <button className="pp-avatar-btn-google" onClick={() => updateAvatarType("google")}>
                                    Аватар від <img className="pp-google-icon" src={googleIcon}></img>
                                </button>
                            )}
                            {(user.user_avatar_type === "custom" || user.user_avatar_type === "google") && (
                                <button className="pp-avatar-btn-reset" onClick={() => updateAvatarType("default")}>
                                    Скинути аватар
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <>
                            <div className=" info-change-form">
                                <input placeholder="Ім'я користувача" value={editInfo.fullname} onChange={(e) => setEditInfo({ ...editInfo, fullname: e.target.value })} />
                                <textarea placeholder="Біографія" value={editInfo.bio} maxLength={150} onChange={(e) => setEditInfo({ ...editInfo, bio: e.target.value })} />
                                <div className="pp-container-btns">
                                    {isEditing && <button className="change-profile-btn" onClick={handleSave}>Зберегти</button>}
                                    {isEditing && <button className="change-profile-btn cancel" onClick={() => setIsEditing(false)}>Скасувати</button>}
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <p><strong>Ім'я:</strong> {formatName(user.personal_info.fullname)}</p>
                            <p><strong>Email:</strong> {user.personal_info.email}</p>
                            <p><strong>Біографія:</strong> {user.personal_info.bio || "Не вказано"}</p>
                            <p><strong>Загальна кількість курсів:</strong> {user.allCourses || 0}</p>
                            <p><strong>Власні курси:</strong> {user.coursesAsTeache || 0}</p>
                        </>
                    )}

                    {ownPage && (
                        <>
                            <div className="pp-edit-butt-container">
                                {!isEditing && <button className="change-password-btn" onClick={() => setIsEditing(true)}>Редагувати профіль</button>}
                                {!user.google_auth && !changePassword && (
                                    <button className="change-password-btn" onClick={() => setChangePassword(true)}>Змінити пароль</button>
                                )}
                            </div>

                            {changePassword && (
                                <div className="password-change-form">
                                    <input type="password" placeholder="Старий пароль" value={passwords.old} onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} />
                                    <input type="password" placeholder="Новий пароль" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                                    <p className="pp-error-message">{error}</p>
                                    <div className="pp-container-btn">
                                        <button className="pp-button-password" onClick={updatePassword}>Оновити</button>
                                        <button className="pp-button-password cancel" onClick={() => setChangePassword(false)}>Скасувати</button>
                                    </div>

                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProfilePage;
