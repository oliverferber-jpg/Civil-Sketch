import SignInCard from "../../../components/auth/ui/SignInCard";

type UserProfile = {
  name: string;
  email: string;
  picture?: string;
};

type SignInPageProps = {
  onSuccess: (user: UserProfile) => void;
};

export default function SignInPage({ onSuccess }: SignInPageProps) {
  return <SignInCard onSuccess={onSuccess} />;
}
