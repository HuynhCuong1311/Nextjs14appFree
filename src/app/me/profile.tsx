"use client";

import accountApiRequest from "@/apiRequests/account";
import { handleErrorApi } from "@/lib/utils";
import { useEffect } from "react";

const Profile = () => {
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const result = await accountApiRequest.meClient();
        console.log("result: ", result);
      } catch (error) {
        handleErrorApi({ error });
      }
    };
    fetchRequest();
  }, []);
  return <div>profile</div>;
};

export default Profile;
