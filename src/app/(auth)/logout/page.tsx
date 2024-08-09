"use client";
import authApiRequest from "@/apiRequests/auth";
import { clienSessionToken } from "@/lib/http";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("sessionToken");
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (sessionToken === clienSessionToken.value) {
      authApiRequest
        .logoutFromNextClientToNextServer(true, signal)
        .then((res) => {
          router.push(`/login?redirectFrom=${pathname}`);
        });
    }
    return () => {
      controller.abort("Component unmounted or dependencies changed");
    };
  }, [sessionToken, router, pathname]);
  return <div>Page</div>;
};

export default LogoutPage;
