import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthLayout from "../components/AuthLayout";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { currentUser, isAdmin, loading, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Waits for the role check (isAdmin) to resolve before routing, so admins
  // land on /admin and everyone else lands on /dashboard (or wherever they
  // were headed before being bounced to /login).
  useEffect(() => {
    if (!loading && currentUser) {
      const target = location.state?.from || (isAdmin ? "/admin" : "/dashboard");
      navigate(target, { replace: true });
    }
  }, [currentUser, isAdmin, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleToken = async (accessToken) => {
    setError("");
    try {
      await loginWithGoogle(accessToken);
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Sign in
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 4 }}>
          Access your road defect reporting console.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ py: 1.3 }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <GoogleSignInButton onToken={handleGoogleToken} onError={handleGoogleError} />

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          New to RoadSense?{" "}
          <RouterLink to="/signup" style={{ color: "#4338ca", fontWeight: 700, textDecoration: "none" }}>
            Create an account
          </RouterLink>
        </Typography>
      </Box>
    </AuthLayout>
  );
}

export function friendlyAuthError(err) {
  const code = err?.code || "";
  const map = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/email-already-in-use": "An account already exists with that email.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method.",
  };
  return map[code] || `Something went wrong${code ? ` (${code})` : ""}. Please try again.`;
}
