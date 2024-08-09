import envConfig from "@/config";
import { normalizePath } from "@/lib/utils";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { redirect } from "next/navigation";

type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined;
};

const ENTITY_ERROR_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };
  constructor({ status, payload }: { status: number; payload: any }) {
    super("Http Error");
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: 422;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: 422;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload });
    this.status = status;
    this.payload = payload;
  }
}

class SessionToken {
  private token = "";
  get value() {
    return this.token;
  }
  set value(token: string) {
    // Nếu gọi method này ở server thì sẽ bị lỗi
    if (typeof window === "undefined") {
      throw new Error("Cannot set session token in server side");
    }
    this.token = token;
  }
}

export const clienSessionToken = new SessionToken();
let clientLogoutRequest: null | Promise<any> = null;

const request = async <Response>(
  method: "GET" | "POST" | "DELETE" | "PUT",
  url: string,
  options?: CustomOptions | undefined
) => {
  const body = options?.body ? JSON.stringify(options.body) : undefined;
  const baseHeader = {
    "Content-Type": "application/json",
    Authorization: clienSessionToken.value
      ? `Bearer ${clienSessionToken.value}`
      : "",
  };
  // nếu không truyền baseUrl thì đặt baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT
  // Nếu truyền vào "" thì đồng nghĩa với việc gọi API đến Nextjs server
  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options?.baseUrl;

  const fullUrl = url.startsWith("/")
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeader,
      ...options?.headers,
    },
    method,
    body,
  });
  const payload: Response = await res.json();
  const data = {
    status: res.status,
    payload,
  };
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        }
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (typeof window !== "undefined") {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: JSON.stringify({ force: true }),
            headers: {
              ...baseHeader,
            },
          });
          await clientLogoutRequest;
          clientLogoutRequest = null;
          clienSessionToken.value = "";
          location.href = "/login";
        }
      } else {
        const sessionToken = (options?.headers as any)?.Authorization?.split(
          " "
        )[1];
        redirect(`/logout?sessionToken=${sessionToken}`);
      }
    } else {
      throw new HttpError(data);
    }
  }
  // Đảm bảo logic dưới đây chỉ chạy ở phía Client (browser)
  if (typeof window !== "undefined") {
    if (
      ["auth/login", "auth/register"].some(
        (item) => item === normalizePath(url)
      )
    ) {
      clienSessionToken.value = (payload as LoginResType).data.token;
    } else if ("auth/logout" === normalizePath(url)) {
      clienSessionToken.value = "";
    }
  }
  return data;
};

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("GET", url, options);
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("POST", url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PUT", url, { ...options, body });
  },
  delete<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("DELETE", url, { ...options, body });
  },
};

export default http;
