import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AppShell from "../components/AppShell";
import apiClient from "../api/client";

const mediaUrl = (filename) => `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/media/${filename}`;

const statusColor = { pending: "error", in_progress: "warning", complete: "success" };
const statusLabel = (s) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

function StatCard({ label, value, icon, tint }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: tint,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await apiClient.get("/api/reports");
    setReports(data.reports || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const counts = useMemo(() => {
    return reports.reduce(
      (acc, r) => {
        acc.total += 1;
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, in_progress: 0, complete: 0 }
    );
  }, [reports]);

  const handleAction = async (id, action) => {
    const { data } = await apiClient.patch(`/api/reports/${id}`, { action });
    setReports((prev) => prev.map((r) => (r.id === id ? data.report : r)));
  };

  const handleDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    const { data } = await apiClient.delete(`/api/reports/${id}`);
    setReports(data.reports || []);
  };

  return (
    <AppShell title="Reported Road Issues" subtitle="Track and resolve citizen-reported potholes and cracks.">
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Reports" value={counts.total} icon={<AssignmentRoundedIcon />} tint="#4338ca" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending" value={counts.pending} icon={<PendingActionsRoundedIcon />} tint="#dc2626" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="In Progress" value={counts.in_progress} icon={<BuildRoundedIcon />} tint="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Completed" value={counts.complete} icon={<CheckCircleRoundedIcon />} tint="#16a34a" />
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#f8fafc", fontWeight: 700, color: "text.secondary", borderBottom: "1px solid #e2e8f0" } }}>
                <TableCell>Reported</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Crack (m)</TableCell>
                <TableCell>Diameter (m)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{report.time || "-"}</TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={mediaUrl(report.image)}
                      alt="Report"
                      sx={{ width: 96, height: 64, objectFit: "cover", borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2" noWrap title={report.location}>
                      {report.location}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.crack_length ? report.crack_length.toFixed(3) : "-"}</TableCell>
                  <TableCell>{report.pothole_diameter ? report.pothole_diameter.toFixed(3) : "-"}</TableCell>
                  <TableCell>
                    <Chip label={statusLabel(report.status)} color={statusColor[report.status]} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {report.status === "complete" ? (
                      <IconButton color="error" onClick={() => setPendingDelete(report.id)} title="Delete">
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    ) : report.status === "pending" ? (
                      <Button size="small" variant="contained" onClick={() => handleAction(report.id, "close")}>
                        {report.type === "pothole" ? "Close Pothole" : report.type === "crack" ? "Fill Crack" : "Start Task"}
                      </Button>
                    ) : (
                      <Button size="small" variant="contained" color="success" onClick={() => handleAction(report.id, "complete")}>
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No reports yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete completed report?</DialogTitle>
        <DialogContent>This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
