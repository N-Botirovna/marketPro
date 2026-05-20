import AutoLoginClient from "@/components/auth/AutoLoginClient";
import ColorInit from "@/helper/ColorInit";

export const metadata = {
  // Auto-login is a one-shot redirect surface; keep it out of indexes.
  robots: { index: false, follow: false },
};

const Page = async ({ searchParams }) => {
  const sp = await searchParams;
  const ticket = (sp?.ticket || "").toString();
  const next = (sp?.next || "/").toString();

  return (
    <>
      <ColorInit color={true} />
      <AutoLoginClient ticket={ticket} next={next} />
    </>
  );
};

export default Page;
