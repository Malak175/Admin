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
  const token = obj?.token ?? data?.token;
  return typeof token === "string" ? token : null;
}

function extractUserData(payload: unknown): AdminLoginResult["userData"] | undefined {
  const obj = asRecord(payload);
  if (obj && typeof obj.user_id === "number") {
    return {
      id: String(obj.user_id),
      email: typeof obj.email === "string" ? obj.email : undefined,
      name: typeof obj.full_name === "string" ? obj.full_name : undefined,
      role: typeof obj.role === "string" ? obj.role : undefined,
    };
  }

  const nestedData = asRecord(obj?.data);
  const userCandidate = obj?.user ?? obj?.admin ?? nestedData?.user ?? nestedData?.admin;
  const user = asRecord(userCandidate);
  if (!user) return undefined;

  const first = typeof user.first_name === "string" ? user.first_name : "";
  const last = typeof user.last_name === "string" ? user.last_name : "";
  const fullName =
    typeof user.fullName === "string"
      ? user.fullName
      : `${first} ${last}`.trim();

  return {
    id: user.id ? String(user.id) : user.user_id ? String(user.user_id) : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    name:
      typeof user.name === "string"
        ? user.name
        : fullName || undefined,
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
