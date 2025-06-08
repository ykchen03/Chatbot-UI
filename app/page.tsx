"use client";
import { Button, Fab, Typography, Link } from "@mui/material";
import { HomeAppBar } from "./components/AppBar";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white py-10 px-6 content-center">
      <HomeAppBar />
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm  mb-8 font-[500]">
          Llama 3.1 Nemotron Ultra
        </p>
        <h1 className="text-6xl font-[500] mb-8">
          Enjoy fast, secure, and easy conversations.
        </h1>
        <p className="mt-8 font-[400] text-base">
          Ask questions, get answers, no nonsense.
        </p>
        <div className="flex justify-center space-x-4 mt-8 mb-12 gap-5 text-sm">
          <Fab
            variant="extended"
            size="medium"
            sx={{
              backgroundColor: "white",
              color: "black",
            }}
          >
            <Typography className="normal-case" fontSize="inherit">
              Start Now
            </Typography>
            <ArrowOutwardIcon sx={{ marginLeft: 1 }} fontSize="inherit" />
          </Fab>
          <Link className="self-center" href="https://build.nvidia.com/nvidia/llama-3_1-nemotron-ultra-253b-v1" color="inherit" fontSize="inherit" underline="none">
            {"Learn More"}
            <ArrowForwardIosIcon sx={{ marginLeft: 1 }} fontSize="inherit" />
          </Link>
        </div>
      </div>
    </main>
  );
}
