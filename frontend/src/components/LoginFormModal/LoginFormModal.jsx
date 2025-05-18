import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../context/useModal';
import './LoginFormModal.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Username or Email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </label>
        {/* No error message initially */}
        {Object.keys(errors).length > 0 && (
          <div className="error-messages">
            {Object.values(errors).map((error, idx) => (
              <p key={idx} className="error-text">{error}</p>
            ))}
          </div>
        )}
        <button type="submit" disabled={credential.length < 4 || password.length < 6}>Log In</button>
      </form>
      <button
        className="demo-user-button"
        onClick={() => {
          dispatch(sessionActions.login({ credential: "Demo-lition", password: "password" }))
          .then(closeModal);
        }}>
        Demo User
      </button>
    </>
  );
}

export default LoginFormModal;
