import React from "react";
import Link from "next/link";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

export const LoginFooterLinks: React.FC = () => {
  return (
    <div className={styles.footerContainer}>
      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>{LOGIN_TEXTS.NO_ACCOUNT_PROMPT}</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Link to Signup */}
      <Link href="/signup" className="btn btn-secondary w-full mb-2 text-black"
        style={{
          border: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <i className="bx bx-user-plus" style={{ fontSize: "1.2rem" }} />
        <span>{LOGIN_TEXTS.SIGNUP_BUTTON}</span>
      </Link>

      {/* Guest Link */}
      <Link href="/" className="btn btn-guest btn-no-hover text-muted">
        <i className="bx bx-walk" style={{ fontSize: "1.3rem" }} />
        <span>{LOGIN_TEXTS.GUEST_BUTTON}</span>
      </Link>
    </div>
  );
};

export const LoginLegalNote: React.FC = () => {
  return (
    <p className={styles.footerTerms}>
      {LOGIN_TEXTS.TERMS_PREFIX}{" "}
      <Link href="/terms" className={styles.termsLink}>
        {LOGIN_TEXTS.TERMS_LABEL}
      </Link>{" "}
      {LOGIN_TEXTS.AND_SEPARATOR}{" "}
      <Link href="/privacy" className={styles.termsLink}>
        {LOGIN_TEXTS.PRIVACY_LABEL}
      </Link>
    </p>
  );
};
