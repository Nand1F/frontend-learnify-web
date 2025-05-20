// WelcomePage.jsx
import { Link } from "react-router-dom";
import '../styles/WelcomePage.css';
import WelcomeImage from "../assets/welcome2.png"

export default function WelcomePage() {
    return (
        <div className="wp-container">
            <div className="wp-content">
                <h1 className="wp-title">Ласкаво просимо до Learnify!</h1>
                <p className="wp-subtitle">
                    Тут ви знайдете курси з програмування, дизайну, математики та інших цікавих напрямків.
                </p>
                <p className="wp-description">
                    Освітня платформа Learnify створена для того, щоб зробити навчання простим, зручним і доступним.
                    Ви зможете переглядати уроки, виконувати завдання, отримувати оцінки та спілкуватись із викладачами.
                </p>
                <div className="wp-buttons">
                    <Link to="/signin" className="wp-btn wp-btn-start">📘 До курсів</Link>
                    <Link to="/signup" className="wp-btn wp-btn-register">📝 Зареєструватись</Link>
                </div>
            </div>
            <div className="wp-image-container">
                <img
                    src={WelcomeImage}
                    alt="Education"
                    className="wp-image"
                />
            </div>
        </div>
    );
}
