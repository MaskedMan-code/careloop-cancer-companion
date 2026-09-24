import { HeartHandshake } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/Buttons";

const items = [
  "Non-clinical companionship",
  "Practical support",
  "Psychosocial / emotional support",
  "Resource navigation",
  "Family support during end-of-life",
];

export default function EndOfLifePage() {
  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="End-of-Life Companion"
        subtitle="Support when care needs a human presence."
        backHref="/human-companion"
      />

      <div className="mb-6 flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute h-28 w-28 rounded-full border-2 border-care-tint2" />
          <span className="absolute h-20 w-20 rounded-full border-2 border-care-border" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-care-green text-white">
            <HeartHandshake size={24} />
          </span>
        </div>
      </div>

      <Card className="mb-4">
        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-care-text">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-care-mint" />
              {i}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mb-4 rounded-xl bg-care-dark px-4 py-3.5 text-center font-serif text-[15px] italic text-white">
        They complement clinical care; they do not replace it.
      </div>

      <p className="mb-5 text-sm text-care-muted">
        Connect with a verified, appropriately trained end-of-life companion.
      </p>

      <PrimaryButton href="/end-of-life/profile">Explore support</PrimaryButton>
    </PageShell>
  );
}
