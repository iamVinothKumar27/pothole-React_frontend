import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext";
import RoadSenseIcon from "./RoadSenseIcon";

export const SIDEBAR_WIDTH = 264;

function NavItem({ to, icon, label, active, onClick }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        mx: 1.5,
        borderRadius: 2,
        textDecoration: "none",
        color: active ? "#fff" : "rgba(226,232,240,0.75)",
        bgcolor: active ? "rgba(99,102,241,0.35)" : "transparent",
        borderLeft: active ? "3px solid #818cf8" : "3px solid transparent",
        transition: "all 0.15s ease",
        "&:hover": { bgcolor: "rgba(148,163,184,0.12)", color: "#fff" },
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

function SidebarContent({ onNavigate }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const items = isAdmin
    ? [
        { to: "/admin", label: "Reports", icon: <AssignmentRoundedIcon fontSize="small" /> },
        { to: "/severe", label: "Severe Locations", icon: <ReportProblemRoundedIcon fontSize="small" /> },
      ]
    : [{ to: "/dashboard", label: "Detect Defects", icon: <DashboardRoundedIcon fontSize="small" /> }];

  const initials = (currentUser?.displayName || currentUser?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 3, py: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #6366f1, #4338ca)",
          }}
        >
          <RoadSenseIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
            RoadSense
          </Typography>
          <Typography sx={{ color: "rgba(226,232,240,0.55)", fontSize: 11.5 }}>
            Defect Intelligence
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ mt: 1, flex: 1 }}>
        {items.map((item) => (
          <NavItem key={item.to} {...item} active={location.pathname === item.to} onClick={onNavigate} />
        ))}
      </Stack>

      <Box sx={{ p: 2, borderTop: "1px solid rgba(148,163,184,0.15)" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 14, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {currentUser?.displayName || "User"}
            </Typography>
            <Typography noWrap sx={{ color: "rgba(226,232,240,0.5)", fontSize: 11.5 }}>
              {currentUser?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: "rgba(226,232,240,0.7)" }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#0f172a",
            borderRight: "1px solid rgba(148,163,184,0.15)",
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, bgcolor: "#0f172a" },
        }}
      >
        <SidebarContent onNavigate={onCloseMobile} />
      </Drawer>
    </>
  );
}
