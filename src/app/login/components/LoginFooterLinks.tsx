import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

export const LoginFooterLinks: React.FC = () => {
  return (
    <div className={styles.footerContainer}>
      {/* Link to Signup */}
      <p className={styles.footerPrompt}>
        <span>{LOGIN_TEXTS.NO_ACCOUNT_PROMPT}</span>{" "}
        <Link href="/signup" className={styles.signupLink}>
          {LOGIN_TEXTS.SIGNUP_BUTTON}
        </Link>
      </p>

      {/* Guest Link */}
      <div className={styles.guestLinkWrapper}>
        <Link href="/" className={styles.guestLink}>
          <span>{LOGIN_TEXTS.GUEST_BUTTON}</span>
          <ArrowLeft size={14} />
        </Link>
      </div>
    </div>
  );
};

export const LoginLegalNote: React.FC = () => {
  return (
    <p className={styles.legalNote}>
      {LOGIN_TEXTS.TERMS_PREFIX}{" "}
      <Link href="/terms" className={styles.legalLink}>
        {LOGIN_TEXTS.TERMS_LABEL}
      </Link>{" "}
      {LOGIN_TEXTS.AND_SEPARATOR}{" "}
      <Link href="/privacy" className={styles.legalLink}>
        {LOGIN_TEXTS.PRIVACY_LABEL}
      </Link>
    </p>
  );
};
