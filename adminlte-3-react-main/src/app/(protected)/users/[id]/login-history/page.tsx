import { LoginHistoryPage } from "@app/views/users/LoginHistoryPage";

export default function Page({ params }: { params: { id: string } }) {
  return <LoginHistoryPage userId={params.id} />;
}
