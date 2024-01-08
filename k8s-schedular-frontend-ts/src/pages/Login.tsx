import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const isValidPassword = (password: string) => password.length >= 6;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!isValidEmail(email) || !isValidPassword(password)) {
      setError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Assuming the server returns a success status (e.g., 200) on successful login
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        setError("Invalid email or password. Please try again.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5" sx={{ color: "skyblue" }}>
            Login
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                style: {
                  color: "skyblue",
                  borderBottom: "2px solid white",
                },
              }}
              InputLabelProps={{
                style: { color: "skyblue" },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: {
                  color: "skyblue",
                  borderBottom: "2px solid white",
                },
              }}
              InputLabelProps={{
                style: { color: "skyblue" },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Snackbar
              open={success}
              autoHideDuration={3000}
              onClose={() => setSuccess(false)}
              message="Login successful"
            />
            <Grid container justifyContent={"flex-end"}>
              <Grid item>
                <Link to="/register" style={{ color: "skyblue" }}>
                  Don't have an account? Register
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Login;
