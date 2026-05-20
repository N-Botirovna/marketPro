import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Errors");
  return (
    <section className="py-5 d-flex justify-content-center align-items-center overflow-hidden not__found">
      <div className="container container-two">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="cart-thank__content text-center">
              <h2 className="cart-thank__title mb-48">{t("notFoundTitle")}</h2>
              <div className="text-file">
                <p>{t("notFoundDescription")}</p>
              </div>
              <div className="d-adjust">
                <Link
                  className="default-btn btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                  href="/"
                >
                  {t("backToHome")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
