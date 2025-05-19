import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/LoginPage.css";
import logo from "../assets/359714481_267240849279415_8934200171544069128_n-Picsart-AiImageEnhancer.jpg";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (validateForm()) {
      try {
        setError("");
        setLoading(true);

        // Call the login function from authService
        const response = await login(email, password);

        console.log("Login successful:", response);

        // If login was successful, navigate to dashboard
        navigate("/");
      } catch (error) {
        console.error("Login error:", error);
        if (
          error.message ===
          "Access denied. Only administrators can access this system."
        ) {
          setError(error.message);
        }
        // Set appropriate error message based on error type
        else if (error.response) {
          // If server responded with an error message
          const errorMessage =
            error.response.data?.message ||
            "Authentication failed. Please check your credentials.";
          setError(errorMessage);
        } else if (error.request) {
          // If the request was made but no response was received
          setError(
            "Unable to connect to the server. Please check your internet connection."
          );
        } else {
          // Something else happened while setting up the request
          setError("Authentication failed. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <div className="brand-logo">
            <img src={logo} alt="Hexagon Logo" width={50} height={50} />
          </div>

          <div className="welcome-content">
            <h1>
              Welcome to <br />
              Admin Portal
            </h1>
            <p>
              Manage your business operations from one centralized dashboard
            </p>
          </div>
          <div className="decoration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Please enter your credentials to continue</p>
          </div>

          {error && (
            <div className="error-alert">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={emailError ? "has-error" : ""}
                />
              </div>
              {emailError && (
                <span className="error-message">{emailError}</span>
              )}
            </div>

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot?
                </Link>
              </div>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={passwordError ? "has-error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>

            <button type="submit" className="signin-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          <div className="secure-note">
            <i className="fas fa-shield-alt"></i>
            <span>This is a secure, encrypted connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
