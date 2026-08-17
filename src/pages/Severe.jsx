import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AppShell from "../components/AppShell";
import apiClient from "../api/client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMap({ location }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [location]);

  if (!coords) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 340, borderRadius: 2, overflow: "hidden", mt: 1, border: "1px solid #e2e8f0" }}>
      <MapContainer center={coords} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>
            <b>Severe Location</b>
            <br />
            {location}
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
}

export default function Severe() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    apiClient.get("/api/severe-locations").then(({ data }) => {
      setLocations(data.severe_locations || []);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell title="Severe Locations" subtitle="Locations with more than 5 reported defects.">
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: locations.length ? 1 : 4 }}>
          {locations.length === 0 ? (
            <Typography align="center" sx={{ py: 4 }} color="text.secondary">
              No severe locations detected.
            </Typography>
          ) : (
            <List>
              {locations.map((loc, index) => (
                <Box key={loc}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      >
                        {openIndex === index ? "Hide Map" : "View Map"}
                      </Button>
                    }
                  >
                    <PlaceRoundedIcon color="error" sx={{ mr: 1.5 }} />
                    <ListItemText primary={loc} />
                  </ListItem>
                  <Collapse in={openIndex === index} unmountOnExit>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <LocationMap location={loc} />
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </List>
          )}
        </Paper>
      )}
    </AppShell>
  );
}
