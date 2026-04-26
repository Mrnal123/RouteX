import { SignIn1 } from "@/components/ui/SignIn1";
import { ParticleField } from "@/components/ui/ParticleField";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <ParticleField />
      <div className="relative z-10 w-full max-w-sm">
        <SignIn1 />
        {/* For demo purposes, reusing SignIn1 as the structure is the same */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
          Register Mode
        </div>
      </div>
    </div>
  );
}
