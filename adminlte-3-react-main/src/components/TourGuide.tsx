"use client";
import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const TourGuide = () => {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check local storage to see if tour has been completed
    const tourDone = localStorage.getItem("tour_completed");
    if (!tourDone) {
      // Delay slightly to ensure layout is rendered
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual tour trigger
  useEffect(() => {
    const handleStartTour = () => {
      localStorage.removeItem("tour_completed");
      setRun(true);
    };

    window.addEventListener("start-tour", handleStartTour);
    return () => window.removeEventListener("start-tour", handleStartTour);
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Welcome to Jan Umang!</h3>
          <p>
            This is your new dashboard. Let&apos;s take a quick tour to help you
            get started.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#menu-sidebar",
      content:
        "This is the Sidebar. Use it to navigate between different modules like Samiti, Users, and Reports.",
      placement: "right",
    },
    {
      target: "#user-panel",
      content: "Here you can quickly see your logged-in account details.",
      placement: "right",
    },
    {
      target: "#main-header",
      content:
        "The Top Header allows you to toggle the sidebar and access your profile.",
      placement: "bottom",
    },
    {
      target: "#user-dropdown",
      content: "Click here to manage your profile or log out.",
      placement: "bottom",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("tour_completed", "true");
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#368F8B",
          textColor: "#333",
          backgroundColor: "#fff",
        },
        buttonNext: {
          backgroundColor: "#368F8B",
          borderRadius: "4px",
          color: "#fff",
        },
        buttonBack: {
          color: "#368F8B",
          marginRight: "10px",
        },
      }}
      callback={handleJoyrideCallback}
      locale={{
        last: "Finish",
        skip: "Skip",
      }}
    />
  );
};

export default TourGuide;
