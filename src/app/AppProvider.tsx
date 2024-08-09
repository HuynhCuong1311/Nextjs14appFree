"use client";

import { clienSessionToken } from "@/lib/http";
import { useState } from "react";

export default function AppProvider({
  children,
  initialSessionToken = "",
}: {
  children: React.ReactNode;
  initialSessionToken?: string;
}) {
  useState(() => {
    if (typeof window !== "undefined") {
      clienSessionToken.value = initialSessionToken;
    }
  });
  // useLayoutEffect(() => {
  //   sessionToken.value = initialSessionToken;
  // }, [initialSessionToken]);
  return <>{children}</>;
}
