import { Link } from 'react-router-dom';
import '../styles/TestCss.css'; // Стилі (необов'язково)
import { useState } from 'react';

export default function TestPage() {

    const [courses] = useState([
        { id: 'c1', title: 'JavaScript Basics', description: 'Learn the fundamentals of JS.' },
        { id: 'c2', title: 'React for Beginners', description: 'Start building React apps.' }
    ]);
    return (
        <div className="cc-course-grid">
            {courses.map(course => (
                <div key={course.id} className="cc-course-card">
                    <h3 className="cc-card-title">{course.title}</h3>
                    <p className="cc-card-desc">{course.description}</p>
                </div>
            ))}
        </div>
    );
}