import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css'; // Стилі (необов'язково)

export default function NotFoundPage() {
    return (
        <div className="not-found-container">
            <h1>404 - Сторінку не знайдено</h1>
            <p>Вибачте, запрошена сторінка не існує.</p>
            <Link to="/" className="home-link">
                Повернутися на головну
            </Link>
        </div>
    );
}