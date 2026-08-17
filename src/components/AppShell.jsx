import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ title, subtitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />

        <Box component="main" sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 4 }}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            px: { xs: 2, md: 4 },
            py: 2.5,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            &copy; {new Date().getFullYear()} RoadSense &mdash; Road Defect Intelligence Platform
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            AI-powered pothole &amp; crack detection
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
