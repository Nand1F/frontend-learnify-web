import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";

import NotFoundPage from "./pages/NotFoundPage";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import MainPage from "./pages/MainPage";

import CoursePage from "./pages/CoursePage";
import ForbiddenPage from "./pages/ForbiddenPage";
import SideBar from "./components/sidebar.componennt";
import Lesson from "../../server/Schema/Lesson";
import LessonPage from "./pages/LessonPage";
import CreateLessonPage from "./pages/CreateLessonPage";
import TeacherReviewPage from "./pages/TeacherReviewPage";
import NotificationsPage from "./pages/NotificationPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPage";
import AppRouter from "./common/AppRouter";
import BlockedPage from "./pages/BlockedPage";
import { ToastContainer } from "react-toastify";


export const UserContext = createContext({});

const App = () => {
    const [userAuth, setUserAuth] = useState({
        access_token: null,
        user: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/auth-user", {}, {
                    withCredentials: true
                });


                setUserAuth({
                    access_token: data.access_token,
                    user: {
                        fullname: data.fullname,
                        user_id: data.user_id,
                        profile_img: data.profile_img,
                        email: data.email,
                        role: data.role,
                        isBlocked: data.isBlocked
                    }
                });


            } catch (err) {
                console.log("Auth check failed:", err.response?.data?.error || err.message);
                setUserAuth({ access_token: null, user: null });
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
                <Route path="/" element={<Navbar />} >
                    <Route element={<AppRouter loading={loading}><Outlet /></AppRouter>}>
                        <Route path="*" element={<NotFoundPage />} />
                        |<Route path="403" element={<ForbiddenPage />} />
                        <Route path="signin" element={<UserAuthForm type="sing-in" />} />
                        <Route path="signup" element={<UserAuthForm type="sing-up" />} />
                        <Route path="admin" element={<AdminPanel></AdminPanel>} />
                        <Route path="blocked" element={<BlockedPage></BlockedPage>} />



                        <Route element={<SideBar />}>
                            <Route path="/course/:id" element={<CoursePage />} />
                            <Route path="/notification" element={<NotificationsPage />} />
                            <Route path="/course/lesson/:id" element={<LessonPage />} />
                            <Route index element={<MainPage />} />
                            <Route path="/course/:id/create-lesson" element={<CreateLessonPage />} ></Route>
                            <Route path="/profile/:id" element={<ProfilePage></ProfilePage>}></Route>
                            <Route path="/course/:courseId/lesson/:lessonId/stats" element={<TeacherReviewPage></TeacherReviewPage>}></Route>
                        </Route>
                    </Route>
                </Route>

            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
        </UserContext.Provider>



    )
}

export default App;