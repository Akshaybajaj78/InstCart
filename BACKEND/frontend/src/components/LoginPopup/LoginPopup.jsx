import React, { useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Sign Up");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            const endpoint = currState === "Sign Up" ? "/customer/signup" : "/customer/login";
            const payload = currState === "Sign Up" ? formData : { email: formData.email, password: formData.password };

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessage(data.message);
            setFormData({ name: '', email: '', password: '' });

            if (currState === "Login") {
                setTimeout(() => {
                    setShowLogin(false);
                }, 2000);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className='login-popup'>
            <div className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
                </div>

                <form onSubmit={handleSubmit} className="login-popup-form">
                    {currState === "Sign Up" && (
                        <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
                    )}
                    <input type="email" name="email" placeholder="Your email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

                    <button type="submit">{currState === "Login" ? "Login" : "Create account"}</button>
                </form>

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>

                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                {currState === "Login" ? (
                    <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                ) : (
                    <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                )}
            </div>
        </div>
    );
};

export default LoginPopup;
