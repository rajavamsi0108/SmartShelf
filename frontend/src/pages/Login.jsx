import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasAccounts, signIn, signUp } from "../auth.js";
import { NotificationAPI } from "../api/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(() => !hasAccounts());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const destination = location.state?.from || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (isSignUp && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Please use a valid Gmail address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    try {
      if (isSignUp) signUp(name.trim(), email.toLowerCase(), password);
      else signIn(email.toLowerCase(), password);
      try {
        await NotificationAPI.subscribe(email.toLowerCase());
      } catch { }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">SS</div>
        <p className="auth-eyebrow">SmartShelf access</p>
        <h1>{isSignUp ? "Create your store account" : "Welcome back"}</h1>
        <p className="auth-copy">
          {isSignUp ? "Save your inventory workspace securely on this device." : "Sign in to manage your stock and expiry alerts."}
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <label className="form-label" htmlFor="name">Your name</label>
              <input id="name" type="text" className="form-control mb-3" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </>
          )}
          <label className="form-label" htmlFor="email">Gmail address</label>
          <input id="email" type="email" className="form-control mb-3" placeholder="storekeeper@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="form-control" placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required />
          <button type="submit" className="btn btn-primary w-100 mt-4">{isSignUp ? "Create account" : "Sign in"}</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <button
          type="button"
          className="google-button"
          onClick={() => setError("Google sign-in needs OAuth credentials configured for this application.")}
        >
          <span className="google-g" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <button type="button" className="auth-switch" onClick={() => { setIsSignUp((value) => !value); setError(""); }}>
          {isSignUp ? "Already have an account? Sign in" : "New to SmartShelf? Create an account"}
        </button>
      </div>
    </main>
  );
}