import { SignIn1 } from "@/components/ui/SignIn1";
import { ParticleField } from "@/components/ui/ParticleField";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <ParticleField />
      <SignIn1 />
    </div>
  );
}
