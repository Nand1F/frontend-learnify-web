
import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input.component";
import "../styles/userAuthForm.page.css";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import LoginButtonGooogle from "../components/button.login.google";
import { UserContext } from "../App";

const UserAuthForm = ({ type }) => {
    let {
        userAuth: { access_token },
        setUserAuth,
    } = useContext(UserContext);

    const authForm = useRef();
    const [error, setError] = useState("");

    const sendDataToServer = (serverRoute, formData) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData, {
                withCredentials: true,
            })
            .then(({ data, status }) => {
                console.log(data, "status : " + status);
                setUserAuth({
                    access_token: data.access_token,
                    user: {
                        fullname: data.fullname,
                        user_id: data.user_id,
                        profile_img: data.profile_img,
                        email: data.email,
                        role: data.role,
                        isBlocked: data.isBlocked
                    },
                });
            })
            .catch((error) => {
                const response = error.response;

                if (!response) {
                    console.error("Unknown error:", error);
                    setError("Сталася непередбачена помилка.");
                    return;
                }

                if (response.status === 409) {
                    setError("Дана пошта вже використовується !");
                } else if (response.status === 404) {
                    setError("Ведено неправильну пошту або пароль");
                } else if (response.status === 410) {
                    setError("Данна пошта вже була зареєстрована за допомогою Google");
                } else {
                    setError(response.data?.error || "Помилка сервера");
                    console.log(response.data?.error, "status : " + response.status);
                }
            });
    };

    useEffect(() => {
        setError("");
    }, [type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        let pathServer = type === "sing-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let passwordRegex = /^(?=.*\d)(?=.*[a-zа-яєіїґ])(?=.*[A-ZА-ЯЄІЇҐ]).{6,20}$/;

        let form = new FormData(authForm.current);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { fullname, email, password } = formData;

        if (type !== "sing-in") {
            if (fullname === "") {
                setError("Ведіть ім'я");
                return;
            } else {
                if (fullname.length < 3) {
                    setError("Мінімальна довжина імені 3 символи");
                    return;
                }
            }
        }

        if (!email.length) {
            setError("Ведіть електрону пошту");
            return;
        }
        if (!emailRegex.test(email)) {
            setError("Невірний формата електороної пошти");
            return;
        }
        if (!passwordRegex.test(password)) {
            setError(
                "Пароль повинен бути від 6 до 20 симлолів, а також містити 1 велику малу та 1 велику букву"
            );
            return;
        }
        setError("");
        sendDataToServer(pathServer, formData);
    };

    return !access_token ? (
        <section className="auth-section">
            <form ref={authForm} className="auth-form">
                <h1>{type === "sing-in" ? "Вітаю з поверненням!" : "Реєстрація"}</h1>

                {type !== "sing-in" && (
                    <InputBox name="fullname" type="text" placeholder="Ім'я" />
                )}

                <InputBox name="email" type="email" placeholder="Пошта" />
                <InputBox name="password" type="password" placeholder="Пароль" />

                <button
                    type="submit"
                    className="auth-button"
                    onClick={handleSubmit}
                >
                    {type === "sing-in" ? "Увійти" : "Зареєструватися"}
                </button>

                {error && <p className="error-text">{error}</p>}

                <LoginButtonGooogle setError={setError} />

                {type === "sing-in" ? (
                    <p className="redirect-link">
                        Ви тут вперше? <Link to="/signup">Зареєструватися</Link>
                    </p>
                ) : (
                    <p className="redirect-link">
                        Вже є акаунт? <Link to="/signin">Увійти</Link>
                    </p>
                )}
            </form>
        </section>
    ) : (
        <Navigate to="/" />
    );
};

export default UserAuthForm;
