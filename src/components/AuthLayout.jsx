import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const FEATURES = [
  "AI pothole detection with confidence scoring",
  "Automated crack length & pothole diameter estimation",
  "One-tap geotagged reporting to civic authorities",
  "Live severe-location mapping for road crews",
];

export default function AuthLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f8fafc" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "44%",
          minWidth: 420,
          p: 6,
          color: "#fff",
          background:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.55), transparent 45%), radial-gradient(circle at 80% 70%, rgba(245,158,11,0.25), transparent 40%), linear-gradient(160deg, #0f172a, #1e1b4b)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
            }}
          >
            <ConstructionRoundedIcon sx={{ color: "#fff" }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>RoadSense</Typography>
        </Stack>

        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15 }}>
            Detect road defects before they become disasters.
          </Typography>
          <Typography sx={{ color: "rgba(226,232,240,0.75)", mb: 4, fontSize: 15.5 }}>
            RoadSense combines computer vision and crowdsourced reporting to keep municipal
            road crews ahead of pothole and crack damage.
          </Typography>
          <Stack spacing={1.75}>
            {FEATURES.map((feature) => (
              <Stack key={feature} direction="row" spacing={1.5} alignItems="flex-start">
                <CheckCircleRoundedIcon sx={{ color: "#818cf8", fontSize: 20, mt: 0.2 }} />
                <Typography sx={{ color: "rgba(226,232,240,0.9)", fontSize: 14.5 }}>
                  {feature}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: "rgba(226,232,240,0.45)" }}>
          &copy; {new Date().getFullYear()} RoadSense &mdash; Road Defect Intelligence Platform
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ display: { xs: "flex", md: "none" }, p: 3 }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
            }}
          >
            <ConstructionRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: "text.primary" }}>RoadSense</Typography>
        </Stack>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          {children}
        </Box>

        <Typography
          variant="caption"
          align="center"
          sx={{ color: "text.secondary", pb: 3, display: { xs: "block", md: "none" } }}
        >
          &copy; {new Date().getFullYear()} RoadSense
        </Typography>
      </Box>
    </Box>
  );
}
