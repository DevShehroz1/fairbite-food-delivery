import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';
import App from './App';
import theme from './utils/theme';
import { AuthProvider } from './context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const WithGoogle = ({ children }) =>
  GOOGLE_CLIENT_ID
    ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>
    : <>{children}</>;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WithGoogle>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <App />
            <ToastContainer
              position="bottom-center"
              autoClose={3500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover={false}
              toastStyle={{ borderRadius: 16, fontWeight: 600 }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </WithGoogle>
  </React.StrictMode>
);
