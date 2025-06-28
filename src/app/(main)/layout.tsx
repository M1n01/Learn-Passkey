import Appshell from "@/components/Appshell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Appshell>{children}</Appshell>;
}
