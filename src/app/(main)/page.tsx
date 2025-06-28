import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box textAlign="center" mb={4}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          認証が完了しました！
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={3}>
          ようこそ、Learn Passkeyへ。
        </Typography>
      </Box>
    </Container>
  );
}
