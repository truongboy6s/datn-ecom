import ResetPasswordClient from "./ResetPasswordClient";

type ResetPasswordSearchParams = {
  token?: string;
};

type ResetPasswordPageProps = {
  searchParams: Promise<ResetPasswordSearchParams>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  return <ResetPasswordClient token={resolvedSearchParams.token || ""} />;
}
