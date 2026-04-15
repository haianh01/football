import { beforeEach, describe, expect, it, vi } from "vitest";

const signInMock = vi.fn();
const signOutMock = vi.fn();

class MockAuthError extends Error {
  type: string;

  constructor(type = "AuthError") {
    super(type);
    this.type = type;
  }
}

vi.mock("next-auth", () => ({
  AuthError: MockAuthError
}));

vi.mock("@/auth", () => ({
  signIn: signInMock,
  signOut: signOutMock
}));

describe("auth actions", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signOutMock.mockReset();
    vi.clearAllMocks();
  });

  it("returns validation error when email is missing", async () => {
    const { loginAction } = await import("./actions");
    const formData = new FormData();

    const state = await loginAction({ error: null }, formData);

    expect(state).toEqual({
      error: "Email là bắt buộc."
    });
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("calls credentials signIn with redirect target", async () => {
    const { loginAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "captain@example.com");
    formData.set("display_name", "Captain");
    formData.set("redirect_to", "/team/create");

    const state = await loginAction({ error: null }, formData);

    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "captain@example.com",
      display_name: "Captain",
      redirectTo: "/team/create"
    });
    expect(state).toEqual({ error: null });
  });

  it("maps auth errors to user-facing message", async () => {
    signInMock.mockRejectedValue(new MockAuthError("CredentialsSignin"));

    const { loginAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "captain@example.com");

    const state = await loginAction({ error: null }, formData);

    expect(state).toEqual({
      error: "Không thể đăng nhập với email này."
    });
  });

  it("starts google sign in with redirect target", async () => {
    const { googleLoginAction } = await import("./actions");
    const formData = new FormData();
    formData.set("redirect_to", "/matches/demo-match");

    await googleLoginAction(formData);

    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/matches/demo-match"
    });
  });

  it("signs out to home", async () => {
    const { logoutAction } = await import("./actions");

    await logoutAction();

    expect(signOutMock).toHaveBeenCalledWith({
      redirectTo: "/"
    });
  });
});
