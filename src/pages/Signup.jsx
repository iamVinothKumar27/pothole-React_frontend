import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthLayout from "../components/AuthLayout";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "./Login";

export default function Signup() {
  const { currentUser, isAdmin, loading, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Waits for the role check (isAdmin) to resolve before routing — handles
  // the case where "Sign up with Google" is actually an existing admin
  // signing in.
  useEffect(() => {
    if (!loading && currentUser) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [currentUser, isAdmin, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(name, email, password);
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
          Create your account
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 4 }}>
          Start reporting and tracking road defects in minutes.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
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
              helperText="At least 6 characters"
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
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </Stack>
        </Box>

        <GoogleSignInButton onToken={handleGoogleToken} onError={handleGoogleError} label="Sign up with Google" />

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Already have an account?{" "}
          <RouterLink to="/login" style={{ color: "#4338ca", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </RouterLink>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
