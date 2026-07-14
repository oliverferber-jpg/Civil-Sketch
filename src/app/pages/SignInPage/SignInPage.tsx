import SignInCard from "../../../components/auth/ui/SignInCard";
import type { UserProfile } from "../../../types/user";

type SignInPageProps = {
  onSuccess: (user: UserProfile) => void;
};

export default function SignInPage({ onSuccess }: SignInPageProps) {
  return <SignInCard onSuccess={onSuccess} />;
}
