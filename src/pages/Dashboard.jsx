import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AppShell from "../components/AppShell";
import apiClient from "../api/client";

const mediaUrl = (filename) => `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/media/${filename}`;

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    // getCurrentPosition can hang indefinitely if the permission prompt is
    // never answered, so this timeout guarantees the report still goes through.
    const timeoutId = setTimeout(() => done(null), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        done(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => {
        clearTimeout(timeoutId);
        done(null);
      },
      { timeout: 8000 }
    );
  });
}

function StatTile({ label, value, accent }) {
  return (
    <Box
      sx={{
        flex: "1 1 140px",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        p: 2,
        bgcolor: accent ? "rgba(67,56,202,0.04)" : "transparent",
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ReportButton({ image, crackLength, potholeDiameter }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleReport = async () => {
    setSending(true);
    setError(false);
    try {
      const location = await getLocation();
      await apiClient.post("/api/reports", {
        image,
        location,
        crack_length: crackLength,
        pothole_diameter: potholeDiameter,
      });
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Chip
        icon={<CheckCircleRoundedIcon />}
        color="success"
        label="Reported to authorities"
        sx={{ mt: 1.5 }}
      />
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
        onClick={handleReport}
        disabled={sending}
        sx={{ mt: 1.5 }}
      >
        {sending ? "Reporting..." : "Report to authorities"}
      </Button>
      <Snackbar open={error} autoHideDuration={4000} onClose={() => setError(false)}>
        <Alert severity="error">Failed to report. Please try again.</Alert>
      </Snackbar>
    </>
  );
}

function ViewableImage({ src, alt, onView }) {
  return (
    <Box
      sx={{
        position: "relative",
        cursor: "pointer",
        "&:hover .view-overlay": { opacity: 1 },
      }}
      onClick={() => onView(src, alt)}
    >
      <CardMedia component="img" image={src} alt={alt} />
      <Box
        className="view-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(15,23,42,0.35)",
          opacity: 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <VisibilityRoundedIcon sx={{ color: "#fff" }} />
      </Box>
    </Box>
  );
}

function ImageViewerDialog({ viewer, onClose }) {
  return (
    <Dialog open={Boolean(viewer)} onClose={onClose} maxWidth="lg" fullWidth>
      <IconButton
        onClick={onClose}
        aria-label="Close preview"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: "rgba(255,255,255,0.85)",
          "&:hover": { bgcolor: "#fff" },
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
      {viewer && <Box component="img" src={viewer.src} alt={viewer.alt} sx={{ width: "100%", display: "block" }} />}
    </Dialog>
  );
}

function UploadPanel({ kind, onResult }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accept = kind === "image" ? "image/*" : "video/*";
  const fieldName = kind === "image" ? "file" : "video";
  const endpoint = kind === "image" ? "/api/analyze/image" : "/api/analyze/video";

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFileName(selected?.name || "");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : "";
    });
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFileName("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    onResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(fieldName, file);
    setLoading(true);
    setError("");
    onResult(null);
    try {
      const { data } = await apiClient.post(endpoint, formData);
      onResult(data);
    } catch {
      setError(`${kind === "image" ? "Image" : "Video"} analysis failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ position: "relative" }}>
        <Box
          component="label"
          htmlFor={`${kind}-upload-input`}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            border: "2px dashed #cbd5e1",
            borderRadius: 3,
            py: previewUrl ? 2.5 : 5,
            cursor: "pointer",
            textAlign: "center",
            bgcolor: "#f8fafc",
            "&:hover": { borderColor: "primary.main", bgcolor: "rgba(67,56,202,0.03)" },
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Selected preview"
              sx={{ maxHeight: 160, maxWidth: "100%", borderRadius: 2, objectFit: "cover" }}
            />
          ) : (
            <CloudUploadRoundedIcon sx={{ fontSize: 32, color: "primary.main" }} />
          )}
          <Typography sx={{ fontWeight: 600 }}>
            {fileName || `Click to choose ${kind === "image" ? "an image" : "a video"}`}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {kind === "image" ? "JPG, PNG up to ~10MB" : "MP4, MOV — sampled every 3 seconds"}
          </Typography>
          <input
            id={`${kind}-upload-input`}
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            required
            onChange={handleFileChange}
          />
        </Box>
        {fileName && (
          <Tooltip title="Remove selected file">
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClear();
              }}
              aria-label="Remove selected file"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 2.5, py: 1.3 }}>
        {loading ? "Analyzing..." : `Analyze ${kind === "image" ? "Image" : "Video"}`}
      </Button>
      {loading && <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />}

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("image");
  const [imageResult, setImageResult] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleTabChange = (_e, value) => {
    setTab(value);
    setImageResult(null);
    setVideoResult(null);
  };

  const openViewer = (src, alt) => setViewer({ src, alt });
  const closeViewer = () => setViewer(null);

  const handleDeleteImage = async () => {
    if (!imageResult) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const filenames = [imageResult.filename, imageResult.crack_filename].filter(Boolean);
      await Promise.all(filenames.map((name) => apiClient.delete(`/media/${encodeURIComponent(name)}`)));
      setImageResult(null);
    } catch {
      setDeleteError("Failed to delete image. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell
      title="Detect Road Defects"
      subtitle="Upload an image or video to run pothole and crack detection."
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2.5 }}>
                <Tab
                  value="image"
                  label="Image"
                  icon={<ImageRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  sx={{ minHeight: 40 }}
                />
                <Tab
                  value="video"
                  label="Video"
                  icon={<VideocamRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  sx={{ minHeight: 40 }}
                />
              </Tabs>

              {tab === "image" ? (
                <UploadPanel kind="image" onResult={setImageResult} />
              ) : (
                <UploadPanel kind="video" onResult={(data) => setVideoResult(data?.results || [])} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {tab === "image" && imageResult && (
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Analysis Result
                  </Typography>
                  <Tooltip title="Delete this analysis and its images">
                    <span>
                      <IconButton size="small" color="error" onClick={handleDeleteImage} disabled={deleting}>
                        {deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteRoundedIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
                  <StatTile
                    label="Pothole"
                    value={
                      <Chip
                        size="small"
                        color={imageResult.pothole === "Pothole Detected" ? "error" : "success"}
                        label={imageResult.pothole}
                      />
                    }
                    accent
                  />
                  <StatTile label="Confidence" value={`${(imageResult.confidence * 100).toFixed(1)}%`} />
                  {imageResult.pothole_diameter > 0 && (
                    <StatTile label="Diameter" value={`${imageResult.pothole_diameter.toFixed(2)} m`} />
                  )}
                  <StatTile label="Crack" value={imageResult.crack_status} />
                  <StatTile label="Crack length" value={`${imageResult.total_crack_length.toFixed(3)} m`} />
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <ViewableImage src={mediaUrl(imageResult.filename)} alt="Uploaded" onView={openViewer} />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                      Original image
                    </Typography>
                    {imageResult.pothole === "Pothole Detected" && (
                      <ReportButton
                        image={imageResult.filename}
                        crackLength={imageResult.total_crack_length}
                        potholeDiameter={imageResult.pothole_diameter}
                      />
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <ViewableImage src={mediaUrl(imageResult.crack_filename)} alt="Crack detection" onView={openViewer} />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                      Crack detection overlay
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {tab === "image" && !imageResult && <EmptyState kind="image" />}

          {tab === "video" && videoResult && videoResult.length > 0 && (
            <Grid container spacing={2}>
              {videoResult.map((frame) => (
                <Grid size={{ xs: 12, sm: 6 }} key={frame.path}>
                  <Card sx={{ borderRadius: 3 }}>
                    <ViewableImage src={mediaUrl(frame.path)} alt={`Frame ${frame.time}`} onView={openViewer} />
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          {frame.time}
                        </Typography>
                        <Chip
                          size="small"
                          color={frame.pothole === "Pothole Detected" ? "error" : "success"}
                          label={frame.pothole}
                        />
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Confidence {(frame.confidence * 100).toFixed(1)}%
                        {frame.pothole_diameter > 0 && ` · Diameter ${frame.pothole_diameter.toFixed(2)}m`}
                      </Typography>
                      {frame.crack_length > 0 && (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Crack length {frame.crack_length.toFixed(3)}m
                        </Typography>
                      )}
                      {frame.pothole === "Pothole Detected" && (
                        <ReportButton
                          image={frame.path}
                          crackLength={frame.crack_length}
                          potholeDiameter={frame.pothole_diameter}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {tab === "video" && videoResult && videoResult.length === 0 && (
            <Typography sx={{ color: "text.secondary" }}>No frames were analyzed.</Typography>
          )}

          {tab === "video" && !videoResult && <EmptyState kind="video" />}
        </Grid>
      </Grid>

      <ImageViewerDialog viewer={viewer} onClose={closeViewer} />
      <Snackbar open={Boolean(deleteError)} autoHideDuration={4000} onClose={() => setDeleteError("")}>
        <Alert severity="error">{deleteError}</Alert>
      </Snackbar>
    </AppShell>
  );
}

function EmptyState({ kind }) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed #e2e8f0",
        borderRadius: 3,
        color: "text.secondary",
        textAlign: "center",
        p: 4,
      }}
    >
      {kind === "image" ? <ImageRoundedIcon sx={{ fontSize: 36, mb: 1 }} /> : <VideocamRoundedIcon sx={{ fontSize: 36, mb: 1 }} />}
      <Typography sx={{ fontWeight: 600 }}>No analysis yet</Typography>
      <Typography variant="body2">
        Upload {kind === "image" ? "an image" : "a video"} on the left to see detection results here.
      </Typography>
    </Box>
  );
}
