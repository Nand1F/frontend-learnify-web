import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';


const LoginButtonGoogle = ({ setError }) => {

    let { userAuth: { access_token, user }, setUserAuth } = useContext(UserContext);

    const navigate = useNavigate();

    const clientIdGoogle = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await axios.post('http://localhost:3000/api/auth/google', {
                token: credential
            }, {
                withCredentials: true
            });
            console.log('Logged in:', res.data);

            setUserAuth({
                access_token: res.data.access_token,
                user: {
                    fullname: res.data.fullname,
                    user_id: res.data.user_id,
                    profile_img: res.data.profile_img,
                    email: res.data.email,
                    role: res.data.role,
                    isBlocked: res.data.isBlocked
                }
            });
            navigate("/")


        } catch (error) {
            console.log('Login error:', error.response.data.error);
            if (setError) { setError(error.response.data.error); }
        }
    };

    return (
        <GoogleOAuthProvider clientId={clientIdGoogle}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    console.log('Login Failed');
                    if (setError) setError("Login Failed")
                }}
            />
        </GoogleOAuthProvider>
    );
};

export default LoginButtonGoogle;
