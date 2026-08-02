"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";
import { SsMenu } from "@/components/ui/SsMenu";
import { SettingsDialog } from "@/components/shared/SettingsDialog";

/** First letter of the name, falling back to the email's. */
function initial(name?: string | null, email?: string | null): string | null {
  const source = name?.trim() || email?.trim();
  return source ? source.charAt(0).toUpperCase() : null;
}

function Avatar({
  image,
  name,
  email,
}: {
  image?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  const letter = initial(name, email);

  return (
    <span className="border-border bg-muted text-muted-foreground relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold">
      {image ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-cover"
          // Google serves these from lh3.googleusercontent.com; skipping the
          // optimizer keeps this working without a next.config remotePatterns entry.
          unoptimized
        />
      ) : (
        (letter ?? <User size={16} />)
      )}
    </span>
  );
}

export function AccountMenu() {
  const { data: session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = session?.user;

  return (
    <>
      <SsMenu
        label="Account menu"
        align="right"
        triggerClassName="rounded-full"
        trigger={
          <Avatar image={user?.image} name={user?.name} email={user?.email} />
        }
        items={[
          {
            label: "Settings",
            icon: <Settings size={16} />,
            onSelect: () => setSettingsOpen(true),
          },
          {
            label: "Sign out",
            icon: <LogOut size={16} />,
            danger: true,
            onSelect: () => void signOut(),
          },
        ]}
      />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
