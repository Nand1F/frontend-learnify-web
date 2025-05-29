import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/BlockedPage.css"

const BlockedPage = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     document.title = 'Доступ заблоковано';
    // }, []);

    return (
        <div className="blocked-container">
            <div className="blocked-card">
                <h1 className="blocked-title">⛔ Доступ заборонено</h1>
                <p className="blocked-message">
                    На жаль, ваш обліковий запис було <strong>заблоковано</strong>.
                </p>
                <p className="blocked-subtext">
                    Ми тимчасово вимкнули ваш доступ до освітньої платформи. Можливо, ви порушили правила або просто занадто добре кодите 😏.
                </p>
            </div>
        </div>
    );
};

export default BlockedPage;
