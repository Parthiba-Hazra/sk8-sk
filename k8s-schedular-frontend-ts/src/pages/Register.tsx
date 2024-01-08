import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  Modal,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

const isValidName = (name: string) => name.trim() !== '';
const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);
const isValidPassword = (password: string): boolean => password.length >= 6;

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!isValidEmail(email) || !isValidPassword(password) || !isValidName(name)) {
      setError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate("/login"); // Redirect to the home page
        }, 2000); // Display success message for 2 seconds before redirecting
      } else {
        const data = await response.json();
        console.error("Registration error:", data.error); 
        setError(data.message || "An error occurred during registration.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred during registration.");
    } finally {
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
            Register
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
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
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleRegister}
              disabled={loading}
              style={{ backgroundColor: "#4CAF50", color: "white" }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Modal open={success}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "white",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <Typography color="success" variant="body2">
                  Registration successful!
                </Typography>
                <Typography variant="body2">Redirecting to home page...</Typography>
              </Box>
            </Modal>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" style={{ color: "skyblue" }}>
                  Already have an account? Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Register;
