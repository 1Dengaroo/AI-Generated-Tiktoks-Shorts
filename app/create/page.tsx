import { CreateWizard } from "@/components/create/CreateWizard";
import { Header } from "@/components/Header";

export default function CreatePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col">
        <CreateWizard />
      </main>
    </div>
  );
}
