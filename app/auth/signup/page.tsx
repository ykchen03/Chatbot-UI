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
  "& .MuiOutlinedInput-root": {
    borderRadius: 99999,
  },
}));

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        phone: phone,
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
      className="bg-white"
    >
      <AuthAppBar />
      <Box
        maxWidth="21.25rem"
        component="form"
        onSubmit={handleSignUp}
      >
        <Typography fontSize="2rem" align="center" fontWeight={500} mb={4}>
          Create Account
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
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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

        <TextFieldStyled
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          error={confirmPassword !== "" && password !== confirmPassword}
          helperText={confirmPassword !== "" && password !== confirmPassword ? "Passwords do not match" : ""}
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
          ) : "Sign Up"}
        </Button>

        <Typography
          variant="body2"
          align="center"
          fontSize="1rem"
          fontWeight={400}
          sx={{ mt: 2,}}>
          Already have an account?{" "}
          <Link href="/auth/signin" color="primary" underline="hover">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}