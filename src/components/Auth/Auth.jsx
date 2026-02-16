import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, LogIn, UserPlus, Loader2, Mail, Lock } from 'lucide-react';

const Auth = ({ showToast, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, signup } = useAuth();

    const validate = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        return true;
    };

    const mapAuthError = (message) => {
        if (message.includes('auth/invalid-credential')) return 'Incorrect email or password.';
        if (message.includes('auth/user-not-found')) return 'No account found with this email.';
        if (message.includes('auth/wrong-password')) return 'Incorrect password.';
        if (message.includes('auth/email-already-in-use')) return 'This email is already registered.';
        if (message.includes('auth/weak-password')) return 'Password is too weak.';
        return message;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const result = isLogin
                ? await login(username, password)
                : await signup(username, password);

            if (!result.success) {
                setError(mapAuthError(result.message));
            } else {
                showToast(isLogin ? 'Login successful!' : 'Account created!');
                if (onLoginSuccess) onLoginSuccess();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo">
                        <Wallet size={32} />
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p>{isLogin ? 'Login to manage your finances' : 'Start your financial journey today'}</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '44px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '44px' }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full"
                        disabled={loading}
                        style={{ height: '52px', marginTop: '10px' }}
                    >
                        {loading ? <Loader2 className="spinner-sm" /> : (isLogin ? <><LogIn size={20} /> Login</> : <><UserPlus size={20} /> Sign Up</>)}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
                    ) : (
                        <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
