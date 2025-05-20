import "../styles/navbar.component.css"

const TopNavBar = () => {
    return (
        <nav className="nav-container">
            <div className="nav-title">Education</div>

            <div className="nav-icons">

                <span className="icon-bell">🔔</span>
                <div className="avatar-circle"></div>
            </div>
        </nav>
    );
};

export default TopNavBar;
