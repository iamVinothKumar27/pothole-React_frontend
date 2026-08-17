import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { isAdmin } = useAuth();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "rgba(248,250,252,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0",
        px: { xs: 2, md: 4 },
        py: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1 }}
          >
            {isAdmin ? "Admin Console" : "Field Console"}
          </Typography>
          <Typography variant="h5" sx={{ color: "text.primary", lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
