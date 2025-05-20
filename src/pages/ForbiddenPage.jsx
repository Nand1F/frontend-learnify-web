import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css'; // Стилі (необов'язково)

export default function ForbiddenPage() {
    return (
        <div className="not-found-container">
            <h1>403 - У вас нема доступу до цієї сторінки </h1>
            <p>Вибачте, але для вас ця сторінка не доступна .</p>
            <Link to="/" className="home-link">
                Повернутися на головну
            </Link>
        </div>
    );
}