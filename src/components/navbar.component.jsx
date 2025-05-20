
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import "../styles/navbar.component.css"
import { useContext } from "react";
import { UserContext } from "../App";
import defaultAvatar from '../assets/default-avatar.jpg';
import axios from "axios";

const Navbar = () => {
    const navigate = useNavigate()

    let { userAuth: { access_token, user }, setUserAuth } = useContext(UserContext);

    // if (!access_token && !user) {
    //     return null; // або можна показати лоадер
    // }
    const logout = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/logout', {}, {
            withCredentials: true
        })
            .then(() => {
                setUserAuth({ access_token: null, user: null });
                navigate("/")

            });
    }

    return (
        <>
            <nav className="nav-container">
                <Link to="/" className="link-logo" >
                    <div className="nav-title">Learnify</div>
                </Link>

                {access_token ? <div className="nav-icons">
                    {/* <Link to="/notification" className="link-notification">
                        <span className="icon-bell">🔔</span>
                    </Link> */}
                    <Link to="/profile">
                        <img
                            className="avatar"
                            src={user.profile_img ? user.profile_img : defaultAvatar}
                        />
                    </Link>
                    <button className="btn-nav" onClick={() => logout()}> Вийти  </button>

                </div> : <div className="nav-icons">
                    {/* <Link to="/signin" className="link-notification">
                        <button className="btn-nav"> Авторизуватися </button>
                    </Link>
                    <Link to="/signup">
                        <button className="btn-nav"> Зареєструватися </button>
                    </Link> */}

                </div>}



            </nav>
            <Outlet /></>

    );
}

export default Navbar;