"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { AuthAppBar } from "@/app/components/AppBar";
import { styled } from "@mui/material/styles";

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    color: "#424242",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-shrink": {
    color: theme.palette.primary.main
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 99999,
    "& fieldset": {
      borderColor: "#424242",
    },
    "&:hover fieldset": {
      borderColor: "#424242",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/chat");
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      className="text-white! bg-charcoal"
    >
      <AuthAppBar />
      <Box
        maxWidth="21.25rem"
        component="form"
        onSubmit={handleAuth}
      >
        <Typography fontSize="2rem" align="center" fontWeight={500} mb={4}>
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextFieldStyled
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        <TextFieldStyled
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: "1.5rem", borderRadius: 99999, textTransform: "none", backgroundColor: "black", "&:hover": { backgroundColor: "#616161" }, height: "3.25rem", fontSize: "1rem"} }
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : "Continue"}
        </Button>

        <Typography
          variant="body2"
          align="center"
          fontSize="1rem"
          fontWeight={400}
          sx={{ mt: 2, color: "#B0BEC5" }}>
          Don't have an account?{" "}
          <Link href="" color="primary" underline="hover">
            Sign Up
          </Link>
          </Typography>
      </Box>
    </Box>
  );
}
