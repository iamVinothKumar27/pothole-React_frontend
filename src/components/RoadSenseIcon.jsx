import SvgIcon from "@mui/material/SvgIcon";

// Brand mark: a road receding into the distance with a dashed center line
// and a pothole — literal, not generic construction/wrench iconography.
export default function RoadSenseIcon(props) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M9.3 3h5.4l3.4 18H5.9L9.3 3z" fillOpacity="0.16" />
      <path
        d="M9.3 3h5.4l3.4 18H5.9L9.3 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 5.5v2.8M12 11v2.8M12 16.5v2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="9.4" cy="15.6" rx="2.15" ry="1.3" fill="currentColor" fillOpacity="0.9" />
    </SvgIcon>
  );
}
