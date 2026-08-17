import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { loadGoogleIdentityServices } from "../lib/googleIdentity";

function GoogleIcon() {
  return (
    <Box component="svg" viewBox="0 0 48 48" sx={{ width: 18, height: 18 }}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Box>
  );
}

export default function GoogleSignInButton({ onToken, onError, label = "Continue with Google" }) {
  const tokenClientRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleIdentityServices()
      .then((google) => {
        if (cancelled) return;
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
          scope: "openid email profile",
          callback: (response) => {
            setRequesting(false);
            if (response?.access_token) {
              onToken(response.access_token);
            } else {
              onError?.(new Error(response?.error || "Google sign-in did not return an access token"));
            }
          },
          error_callback: (err) => {
            setRequesting(false);
            onError?.(err);
          },
        });
        setReady(true);
      })
      .catch((err) => onError?.(err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!tokenClientRef.current) return;
    setRequesting(true);
    tokenClientRef.current.requestAccessToken();
  };

  return (
    <Stack spacing={2.25} sx={{ my: 2.25 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          or
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>
      <Button
        onClick={handleClick}
        disabled={!ready || requesting}
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.2,
          borderColor: "#e2e8f0",
          color: "text.primary",
          "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
        }}
      >
        {requesting ? "Signing in..." : label}
      </Button>
    </Stack>
  );
}
