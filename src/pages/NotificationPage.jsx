import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/NotificationPage.css';
import { formatedDate } from '../common/formattedDate';
import bell from "../assets/bell.png"

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState();
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 10;

    const loadNotifications = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/notifications?skip=${skip}&limit=${limit}`, {
                withCredentials: true,
            });

            setNotifications(prev => [...prev, ...res.data.notifications]);
            setSkip(prev => prev + limit);
            setHasMore(res.data.hasMore);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }

    };

    const markAllAsRead = async (notes) => {
        // console.log(notes)
        const unread = notes.filter(n => !n.isRead);
        if (unread.length === 0) return;

        const ids = unread.map(n => n._id);

        try {
            await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/notifications/read`, { ids }, {
                withCredentials: true,
            });

        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    useEffect(() => {
        let timeoutId;
        timeoutId = setTimeout(() => {
            markAllAsRead(notifications);
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [notifications])


    useEffect(() => {

        const fetchNotification = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/notifications?skip=${skip}&limit=${limit}`, {
                    withCredentials: true,
                });

                setNotifications(res.data.notifications);
                setSkip(limit);
                setHasMore(res.data.hasMore);
            } catch (err) {
                console.error('Failed to load notifications:', err);
            } finally {
                setIsLoading(false)
            }
        };

        fetchNotification();

    }, []);



    const markAsRead = async (id) => {
        try {
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/notifications/read`, { id }, { withCredentials: true });
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };
    if (isLoading) return null;

    return (
        <div className="notifications-container">
            <div className='np-title-container'>
                <h2>Повідомлення</h2>
                <img className="np_img_bell" src={bell} alt="bell" />
            </div>

            <div className="notifications-list">
                {(!notifications || notifications.length === 0) ? (
                    <p className="empty">Повідомлення відсутні</p>
                ) : (
                    notifications.map((note) => (
                        <a
                            key={note._id}
                            href={note.link}
                            className={`notification-item ${note.isRead ? 'read' : 'unread'}`}
                            // target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => markAsRead(note._id)}
                        >
                            <div className="notification-header">
                                <strong>{note.title}</strong>
                                {!note.isRead && <span className="unread-dot">●</span>}
                            </div>
                            <div className="note-text">{note.message}</div>
                            <div className="notification-date">
                                {formatedDate(note.createdAt)}
                            </div>
                        </a>
                    ))
                )}
                {hasMore && (
                    <button className="load-more" onClick={loadNotifications}>
                        Завантажити ще
                    </button>
                )}
            </div>
        </div>

    );
};

export default NotificationsPage;
