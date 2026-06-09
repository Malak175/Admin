import { axiosInstance } from "@/services/api/axiosInstance";

export interface AdminLoginResult {
  token: string;
  userData?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    avatar?: string;
  };
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function extractToken(payload: unknown): string | null {
  const obj = asRecord(payload);
  const data = asRecord(obj?.data);
  const token = data?.token ?? obj?.token;
  return typeof token === "string" ? token : null;
}

function extractUserData(payload: unknown): AdminLoginResult["userData"] | undefined {
  const obj = asRecord(payload);
  const data = asRecord(obj?.data);
  const user = asRecord(data?.user ?? obj?.user);
  if (!user) return undefined;

  return {
    id:
      typeof user.id === "number" || typeof user.id === "string"
        ? String(user.id)
        : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    name: typeof user.fullName === "string" ? user.fullName : undefined,
    role: typeof user.role === "string" ? user.role : undefined,
    avatar: typeof user.avatar === "string" ? user.avatar : undefined,
  };
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  const loginEndpoint =
    import.meta.env.VITE_ADMIN_LOGIN_ENDPOINT || "/api/v1/auth/signin";

  const { data } = await axiosInstance.post(loginEndpoint, { email, password });
  const token = extractToken(data);

  if (!token) {
    throw new Error("Login succeeded but no admin token was returned by backend.");
  }

  return {
    token,
    userData: extractUserData(data),
  };
}
