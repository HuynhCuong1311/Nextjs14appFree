"use client";

import authApiRequest from "@/apiRequests/auth";
import { clienSessionToken } from "@/lib/http";
import { differenceInHours } from "date-fns";
import { useEffect } from "react";

export default function SlideSession() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const expiresAt = new Date(clienSessionToken.expiresAt);
      if (differenceInHours(expiresAt, now) < 1) {
        const res =
          await authApiRequest.slideSessionFromNextClientToNextServer();
        clienSessionToken.expiresAt = res.payload.data.expiresAt;
      }
    }, 1000 * 60 * 60); // 1h
    return () => clearInterval(interval);
  }, []);

  return null;
}
