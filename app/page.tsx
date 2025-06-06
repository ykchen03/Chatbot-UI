"use client";
import { useState } from "react";
import { Button, Fab, Typography } from "@mui/material";
import { HomeAppBar } from "./components/AppBar";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Banner from "./components/Banner";

export default function Home() {

  // Sample items for the looper
  const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
  return (
    <main className="min-h-screen bg-black py-10 px-6 content-center">
      <HomeAppBar />
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm text-white mb-8 font-[500]">
          Llama 3.1 Nemotron Ultra
        </p>
        <h1 className="text-6xl font-[500] text-white mb-8">
          Enjoy fast, secure, and private conversations.
        </h1>
        <p className="mt-8 font-[400] text-base text-white">
          Something Something Something
        </p>
        <div className="flex justify-center space-x-4 mt-8 mb-12 gap-4">
          <Fab
            variant="extended"
            size="medium"
            sx={{
              backgroundColor: "white",
              color: "black",
              fontSize: "0.875rem",
            }}
          >
            <Typography className="normal-case" fontSize="inherit">
              Start Now
            </Typography>
            <ArrowOutwardIcon sx={{ marginLeft: 1 }} fontSize="inherit" />
          </Fab>
          <Button variant="outlined" color="primary">
            Learn More
          </Button>
        </div>

        <Banner items={items} speed={8000} />
      </div>
    </main>
  );
}
