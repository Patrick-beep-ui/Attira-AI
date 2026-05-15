export async function signupFlow(
  email: string,
  password: string,
  signUpFn: (email: string, password: string) => Promise<{ error?: any }>,
  onSuccess: () => void
) {
  const { error } = await signUpFn(email, password)
  if (error) return { error };
  onSuccess();
  return {};
}
